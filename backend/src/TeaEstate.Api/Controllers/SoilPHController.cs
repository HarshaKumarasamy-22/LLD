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

namespace TeaEstate.Api.Controllers;

[Authorize]
public class SoilPHController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;
    private readonly IAgronomyService _agronomyService;

    public SoilPHController(ITeaEstateDbContext context, IAgronomyService agronomyService)
    {
        _context = context;
        _agronomyService = agronomyService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SoilPHRecordDto>>> GetRecords(
        [FromQuery] Guid? fieldId = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var query = _context.SoilPHRecords
            .Include(r => r.Field)
            .AsNoTracking();

        if (fieldId.HasValue)
            query = query.Where(r => r.FieldId == fieldId.Value);

        if (fromDate.HasValue)
            query = query.Where(r => r.TestedDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(r => r.TestedDate <= toDate.Value);

        var records = await query
            .OrderByDescending(r => r.TestedDate)
            .Select(r => new SoilPHRecordDto(
                r.Id,
                r.FieldId,
                r.Field != null ? r.Field.Code : "",
                r.Field != null ? r.Field.Name : "",
                r.TestedDate,
                r.PHValue,
                r.SampleRef,
                r.TesterName,
                r.Notes,
                r.PHValue >= 4.5m && r.PHValue <= 5.5m // Advisory tea tolerance
            ))
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("latest-by-field")]
    public async Task<ActionResult<IEnumerable<FieldLatestSoilPHDto>>> GetLatestByField()
    {
        var fields = await _context.Fields.OrderBy(f => f.Code).ToListAsync();
        var result = new List<FieldLatestSoilPHDto>();

        foreach (var field in fields)
        {
            var latest = await _context.SoilPHRecords
                .Where(r => r.FieldId == field.Id)
                .OrderByDescending(r => r.TestedDate)
                .FirstOrDefaultAsync();

            result.Add(new FieldLatestSoilPHDto(
                FieldId: field.Id,
                FieldCode: field.Code,
                FieldName: field.Name,
                LatestTestedDate: latest?.TestedDate,
                LatestPHValue: latest?.PHValue,
                IsOptimal: latest != null ? _agronomyService.IsOptimalSoilPH(latest.PHValue) : null
            ));
        }

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<SoilPHRecordDto>> RecordSoilPH([FromBody] RecordSoilPHRequest request)
    {
        // Validation: pH values from 0 to 14 inclusive (FR-053)
        if (request.PHValue < 0 || request.PHValue > 14)
        {
            return BadRequest(new { message = "pH value must be between 0.00 and 14.00 inclusive." });
        }

        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null) return BadRequest(new { message = "Invalid field ID." });

        var record = new SoilPHRecord
        {
            FieldId = request.FieldId,
            TestedDate = request.TestedDate,
            PHValue = request.PHValue,
            SampleRef = request.SampleRef,
            TesterName = request.TesterName,
            Notes = request.Notes
        };

        _context.SoilPHRecords.Add(record);
        await _context.SaveChangesAsync();

        var isOptimal = _agronomyService.IsOptimalSoilPH(record.PHValue);

        return Ok(new SoilPHRecordDto(
            record.Id,
            record.FieldId,
            field.Code,
            field.Name,
            record.TestedDate,
            record.PHValue,
            record.SampleRef,
            record.TesterName,
            record.Notes,
            isOptimal
        ));
    }
}
