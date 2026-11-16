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
public class WeedingController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;
    private readonly IAgronomyService _agronomyService;

    public WeedingController(ITeaEstateDbContext context, IAgronomyService agronomyService)
    {
        _context = context;
        _agronomyService = agronomyService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WeedingActivityDto>>> GetActivities(
        [FromQuery] Guid? fieldId = null,
        [FromQuery] string? statusFilter = null)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = _context.WeedingActivities
            .Include(w => w.Field)
            .AsNoTracking();

        if (fieldId.HasValue)
            query = query.Where(w => w.FieldId == fieldId.Value);

        var list = await query
            .OrderByDescending(w => w.PlannedDate)
            .ToListAsync();

        var result = list.Select(w =>
        {
            var status = _agronomyService.DeriveWeedingStatus(w.PlannedDate, w.CompletedDate, today);
            return new WeedingActivityDto(
                w.Id,
                w.FieldId,
                w.Field != null ? w.Field.Code : "",
                w.Field != null ? w.Field.Name : "",
                w.PlannedDate,
                w.CompletedDate,
                w.Method,
                w.ResponsiblePerson,
                w.Notes,
                status
            );
        });

        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            result = result.Where(r => r.Status.Equals(statusFilter, StringComparison.OrdinalIgnoreCase));
        }

        return Ok(result);
    }

    [HttpPost("plan")]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<WeedingActivityDto>> CreatePlan([FromBody] CreateWeedingPlanRequest request)
    {
        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null) return BadRequest(new { message = "Invalid field ID." });

        var entry = new WeedingActivity
        {
            FieldId = request.FieldId,
            PlannedDate = request.PlannedDate,
            Method = request.Method,
            Notes = request.Notes
        };

        _context.WeedingActivities.Add(entry);
        await _context.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var status = _agronomyService.DeriveWeedingStatus(entry.PlannedDate, entry.CompletedDate, today);

        return Ok(new WeedingActivityDto(
            entry.Id,
            entry.FieldId,
            field.Code,
            field.Name,
            entry.PlannedDate,
            entry.CompletedDate,
            entry.Method,
            entry.ResponsiblePerson,
            entry.Notes,
            status
        ));
    }

    [HttpPut("{id}/complete")]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<WeedingActivityDto>> CompleteWeeding(Guid id, [FromBody] CompleteWeedingRequest request)
    {
        var activity = await _context.WeedingActivities.Include(w => w.Field).FirstOrDefaultAsync(w => w.Id == id);
        if (activity == null) return NotFound(new { message = "Weeding activity not found." });

        activity.CompletedDate = request.CompletedDate;
        activity.ResponsiblePerson = request.ResponsiblePerson;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            activity.Notes = string.IsNullOrEmpty(activity.Notes) ? request.Notes : $"{activity.Notes} | {request.Notes}";
        }

        await _context.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var status = _agronomyService.DeriveWeedingStatus(activity.PlannedDate, activity.CompletedDate, today);

        return Ok(new WeedingActivityDto(
            activity.Id,
            activity.FieldId,
            activity.Field?.Code ?? "",
            activity.Field?.Name ?? "",
            activity.PlannedDate,
            activity.CompletedDate,
            activity.Method,
            activity.ResponsiblePerson,
            activity.Notes,
            status
        ));
    }
}
