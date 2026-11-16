using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaEstate.Application.Common.Interfaces;
using TeaEstate.Application.DTOs;
using TeaEstate.Application.Services;
using TeaEstate.Domain.Entities;
using TeaEstate.Domain.Enums;

namespace TeaEstate.Api.Controllers;

[Authorize]
public class FieldWeightsController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;
    private readonly IYieldCalculationService _calculator;

    public FieldWeightsController(ITeaEstateDbContext context, IYieldCalculationService calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FieldWeightDto>>> GetWeights(
        [FromQuery] Guid? fieldId = null,
        [FromQuery] DateOnly? date = null,
        [FromQuery] int? month = null,
        [FromQuery] int? year = null)
    {
        var query = _context.FieldWeights
            .Include(w => w.Field)
            .AsNoTracking();

        if (fieldId.HasValue)
            query = query.Where(w => w.FieldId == fieldId.Value);

        if (date.HasValue)
            query = query.Where(w => w.WeightDate == date.Value);

        if (year.HasValue)
            query = query.Where(w => w.WeightDate.Year == year.Value);

        if (month.HasValue)
            query = query.Where(w => w.WeightDate.Month == month.Value);

        var list = await query
            .OrderByDescending(w => w.WeightDate)
            .ThenBy(w => w.Field != null ? w.Field.Code : "")
            .Select(w => new FieldWeightDto(
                w.Id,
                w.FieldId,
                w.Field != null ? w.Field.Code : "",
                w.Field != null ? w.Field.Name : "",
                w.WeightDate,
                w.Session,
                w.WeightKg,
                w.Notes,
                w.Status.ToString()
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FieldMtdSummaryDto>> GetMtdSummary(
        [FromQuery] Guid fieldId,
        [FromQuery] DateOnly? cutoffDate = null)
    {
        var targetDate = cutoffDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var firstDayOfMonth = new DateOnly(targetDate.Year, targetDate.Month, 1);

        var field = await _context.Fields.FindAsync(fieldId);
        if (field == null) return NotFound(new { message = "Field not found." });

        var records = await _context.FieldWeights
            .Where(w => w.FieldId == fieldId && w.WeightDate >= firstDayOfMonth && w.WeightDate <= targetDate)
            .Select(w => new { w.WeightDate, w.WeightKg })
            .ToListAsync();

        var entryTuples = records.Select(r => (r.WeightDate, r.WeightKg));
        var mtdKg = _calculator.CalculateMtd(entryTuples, targetDate);

        return Ok(new FieldMtdSummaryDto(
            field.Id,
            field.Code,
            field.Name,
            targetDate.Year,
            targetDate.Month,
            targetDate,
            mtdKg,
            records.Count
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor,DataEntry")]
    public async Task<ActionResult<FieldWeightDto>> RecordWeight([FromBody] RecordFieldWeightRequest request)
    {
        if (request.WeightKg <= 0)
        {
            return BadRequest(new { message = "Weight must be greater than zero kg." });
        }

        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null)
        {
            return BadRequest(new { message = "Invalid field ID." });
        }

        // Check duplicate entry for date + field + session (AC-01, FR-024)
        var exists = await _context.FieldWeights.AnyAsync(w =>
            w.FieldId == request.FieldId &&
            w.WeightDate == request.WeightDate &&
            w.Session == request.Session);

        if (exists)
        {
            return Conflict(new { message = "A field weight record already exists for this field, date, and session." });
        }

        var entry = new FieldWeight
        {
            FieldId = request.FieldId,
            WeightDate = request.WeightDate,
            Session = request.Session,
            WeightKg = request.WeightKg,
            Notes = request.Notes,
            Status = RecordStatus.Recorded,
            CreatedByUserId = CurrentUserId
        };

        _context.FieldWeights.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new FieldWeightDto(
            entry.Id,
            entry.FieldId,
            field.Code,
            field.Name,
            entry.WeightDate,
            entry.Session,
            entry.WeightKg,
            entry.Notes,
            entry.Status.ToString()
        ));
    }
}
