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

namespace TeaEstate.Api.Controllers;

[Authorize]
public class PruningController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;

    public PruningController(ITeaEstateDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PruningRecordDto>>> GetRecords(
        [FromQuery] Guid? fieldId = null)
    {
        var query = _context.PruningRecords
            .Include(p => p.Field)
            .AsNoTracking();

        if (fieldId.HasValue)
            query = query.Where(p => p.FieldId == fieldId.Value);

        var list = await query
            .OrderByDescending(p => p.PruningDate)
            .Select(p => new PruningRecordDto(
                p.Id,
                p.FieldId,
                p.Field != null ? p.Field.Code : "",
                p.Field != null ? p.Field.Name : "",
                p.PruningDate,
                p.PruningType,
                p.Notes
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("last-by-field")]
    public async Task<ActionResult<IEnumerable<FieldPruningSummaryDto>>> GetLastPruningByField()
    {
        var fields = await _context.Fields.OrderBy(f => f.Code).ToListAsync();
        var summaries = new List<FieldPruningSummaryDto>();

        foreach (var field in fields)
        {
            var records = await _context.PruningRecords
                .Where(p => p.FieldId == field.Id)
                .OrderByDescending(p => p.PruningDate)
                .ToListAsync();

            var latest = records.FirstOrDefault();

            summaries.Add(new FieldPruningSummaryDto(
                FieldId: field.Id,
                FieldCode: field.Code,
                FieldName: field.Name,
                LastPruningDate: latest?.PruningDate,
                LastPruningType: latest?.PruningType,
                TotalPruningCount: records.Count
            ));
        }

        return Ok(summaries);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<PruningRecordDto>> RecordPruning([FromBody] RecordPruningRequest request)
    {
        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null) return BadRequest(new { message = "Invalid field ID." });

        var entry = new PruningRecord
        {
            FieldId = request.FieldId,
            PruningDate = request.PruningDate,
            PruningType = request.PruningType,
            Notes = request.Notes
        };

        _context.PruningRecords.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new PruningRecordDto(
            entry.Id,
            entry.FieldId,
            field.Code,
            field.Name,
            entry.PruningDate,
            entry.PruningType,
            entry.Notes
        ));
    }
}
