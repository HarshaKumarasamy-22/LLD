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
public class FieldsController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;

    public FieldsController(ITeaEstateDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FieldDto>>> GetFields([FromQuery] bool? activeOnly = null)
    {
        var query = _context.Fields
            .Include(f => f.Division)
            .AsNoTracking();

        if (activeOnly == true)
        {
            query = query.Where(f => f.IsActive);
        }

        var fields = await query
            .OrderBy(f => f.Code)
            .Select(f => new FieldDto(
                f.Id,
                f.EstateId,
                f.DivisionId,
                f.Division != null ? f.Division.Name : null,
                f.Code,
                f.Name,
                f.AreaHectares,
                f.IsActive,
                f.Notes
            ))
            .ToListAsync();

        return Ok(fields);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FieldDto>> GetFieldById(Guid id)
    {
        var field = await _context.Fields
            .Include(f => f.Division)
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id);

        if (field == null) return NotFound(new { message = $"Field with ID {id} not found." });

        return Ok(new FieldDto(
            field.Id,
            field.EstateId,
            field.DivisionId,
            field.Division?.Name,
            field.Code,
            field.Name,
            field.AreaHectares,
            field.IsActive,
            field.Notes
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager")]
    public async Task<ActionResult<FieldDto>> CreateField([FromBody] CreateFieldRequest request)
    {
        if (request.AreaHectares <= 0)
        {
            return BadRequest(new { message = "Field area must be greater than zero hectares." });
        }

        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Field code is required." });
        }

        var estate = await _context.Estates.FirstOrDefaultAsync();
        if (estate == null) return BadRequest(new { message = "Estate not configured." });

        // Duplicate code validation within estate (AC-01)
        var exists = await _context.Fields.AnyAsync(f => f.EstateId == estate.Id && f.Code.ToLower() == request.Code.Trim().ToLower());
        if (exists)
        {
            return Conflict(new { message = $"A field with code '{request.Code}' already exists." });
        }

        var field = new Field
        {
            EstateId = estate.Id,
            DivisionId = request.DivisionId,
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            AreaHectares = request.AreaHectares,
            IsActive = true,
            Notes = request.Notes
        };

        _context.Fields.Add(field);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFieldById), new { id = field.Id }, new FieldDto(
            field.Id,
            field.EstateId,
            field.DivisionId,
            null,
            field.Code,
            field.Name,
            field.AreaHectares,
            field.IsActive,
            field.Notes
        ));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator,EstateManager")]
    public async Task<IActionResult> UpdateField(Guid id, [FromBody] UpdateFieldRequest request)
    {
        if (request.AreaHectares <= 0)
        {
            return BadRequest(new { message = "Field area must be greater than zero hectares." });
        }

        var field = await _context.Fields.FindAsync(id);
        if (field == null) return NotFound();

        field.DivisionId = request.DivisionId;
        field.Name = request.Name.Trim();
        field.AreaHectares = request.AreaHectares;
        field.IsActive = request.IsActive;
        field.Notes = request.Notes;
        field.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
