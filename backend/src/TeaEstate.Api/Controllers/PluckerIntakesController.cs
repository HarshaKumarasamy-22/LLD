using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaEstate.Application.Common.Interfaces;
using TeaEstate.Application.DTOs;
using TeaEstate.Domain.Entities;
using TeaEstate.Domain.Enums;

namespace TeaEstate.Api.Controllers;

[Authorize]
public class PluckerIntakesController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;

    public PluckerIntakesController(ITeaEstateDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PluckerIntakeDto>>> GetIntakes(
        [FromQuery] Guid? pluckerId = null,
        [FromQuery] Guid? fieldId = null,
        [FromQuery] DateOnly? date = null)
    {
        var query = _context.PluckerIntakes
            .Include(i => i.Field)
            .Include(i => i.Plucker)
            .AsNoTracking();

        if (pluckerId.HasValue)
            query = query.Where(i => i.PluckerId == pluckerId.Value);

        if (fieldId.HasValue)
            query = query.Where(i => i.FieldId == fieldId.Value);

        if (date.HasValue)
            query = query.Where(i => i.IntakeDate == date.Value);

        var list = await query
            .OrderByDescending(i => i.IntakeDate)
            .ThenBy(i => i.Plucker != null ? i.Plucker.EmployeeCode : "")
            .Select(i => new PluckerIntakeDto(
                i.Id,
                i.FieldId,
                i.Field != null ? i.Field.Code : "",
                i.PluckerId,
                i.Plucker != null ? i.Plucker.EmployeeCode : "",
                i.Plucker != null ? i.Plucker.FullName : "",
                i.IntakeDate,
                i.Session,
                i.WeightKg,
                i.Notes,
                i.Status.ToString()
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor,DataEntry")]
    public async Task<ActionResult<PluckerIntakeDto>> RecordIntake([FromBody] RecordPluckerIntakeRequest request)
    {
        if (request.WeightKg <= 0)
        {
            return BadRequest(new { message = "Plucker intake weight must be greater than zero kg." });
        }

        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null) return BadRequest(new { message = "Invalid field ID." });

        var plucker = await _context.Pluckers.FindAsync(request.PluckerId);
        if (plucker == null) return BadRequest(new { message = "Invalid plucker ID." });

        // Check duplicate entry for date + plucker + field + session (FR-024)
        var exists = await _context.PluckerIntakes.AnyAsync(i =>
            i.FieldId == request.FieldId &&
            i.PluckerId == request.PluckerId &&
            i.IntakeDate == request.IntakeDate &&
            i.Session == request.Session);

        if (exists)
        {
            return Conflict(new { message = "An intake record already exists for this plucker, field, date, and session." });
        }

        var entry = new PluckerIntake
        {
            FieldId = request.FieldId,
            PluckerId = request.PluckerId,
            IntakeDate = request.IntakeDate,
            Session = request.Session,
            WeightKg = request.WeightKg,
            Notes = request.Notes,
            Status = RecordStatus.Recorded,
            CreatedByUserId = CurrentUserId
        };

        _context.PluckerIntakes.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new PluckerIntakeDto(
            entry.Id,
            entry.FieldId,
            field.Code,
            entry.PluckerId,
            plucker.EmployeeCode,
            plucker.FullName,
            entry.IntakeDate,
            entry.Session,
            entry.WeightKg,
            entry.Notes,
            entry.Status.ToString()
        ));
    }
}
