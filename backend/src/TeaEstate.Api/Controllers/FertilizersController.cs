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
public class FertilizersController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;

    public FertilizersController(ITeaEstateDbContext context)
    {
        _context = context;
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<FertilizerTypeDto>>> GetFertilizerTypes()
    {
        var types = await _context.FertilizerTypes
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new FertilizerTypeDto(t.Id, t.Name, t.IsActive))
            .ToListAsync();

        return Ok(types);
    }

    [HttpGet("applications")]
    public async Task<ActionResult<IEnumerable<FertilizerApplicationDto>>> GetApplications(
        [FromQuery] Guid? fieldId = null,
        [FromQuery] Guid? fertilizerTypeId = null,
        [FromQuery] DateOnly? fromDate = null,
        [FromQuery] DateOnly? toDate = null)
    {
        var query = _context.FertilizerApplications
            .Include(a => a.Field)
            .Include(a => a.FertilizerType)
            .AsNoTracking();

        if (fieldId.HasValue)
            query = query.Where(a => a.FieldId == fieldId.Value);

        if (fertilizerTypeId.HasValue)
            query = query.Where(a => a.FertilizerTypeId == fertilizerTypeId.Value);

        if (fromDate.HasValue)
            query = query.Where(a => a.ApplicationDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.ApplicationDate <= toDate.Value);

        var list = await query
            .OrderByDescending(a => a.ApplicationDate)
            .Select(a => new FertilizerApplicationDto(
                a.Id,
                a.FieldId,
                a.Field != null ? a.Field.Code : "",
                a.Field != null ? a.Field.Name : "",
                a.FertilizerTypeId,
                a.FertilizerType != null ? a.FertilizerType.Name : "",
                a.ApplicationDate,
                a.QuantityKg,
                a.Method,
                a.Notes
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost("applications")]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<FertilizerApplicationDto>> RecordApplication([FromBody] RecordFertilizerRequest request)
    {
        if (request.QuantityKg <= 0)
        {
            return BadRequest(new { message = "Fertilizer quantity must be greater than zero kg." });
        }

        var field = await _context.Fields.FindAsync(request.FieldId);
        if (field == null) return BadRequest(new { message = "Invalid field ID." });

        var fertType = await _context.FertilizerTypes.FindAsync(request.FertilizerTypeId);
        if (fertType == null) return BadRequest(new { message = "Invalid fertilizer type." });

        var entry = new FertilizerApplication
        {
            FieldId = request.FieldId,
            FertilizerTypeId = request.FertilizerTypeId,
            ApplicationDate = request.ApplicationDate,
            QuantityKg = request.QuantityKg,
            Method = request.Method,
            Notes = request.Notes
        };

        _context.FertilizerApplications.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new FertilizerApplicationDto(
            entry.Id,
            entry.FieldId,
            field.Code,
            field.Name,
            entry.FertilizerTypeId,
            fertType.Name,
            entry.ApplicationDate,
            entry.QuantityKg,
            entry.Method,
            entry.Notes
        ));
    }
}
