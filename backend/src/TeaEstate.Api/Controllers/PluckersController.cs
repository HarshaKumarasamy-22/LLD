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
public class PluckersController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;

    public PluckersController(ITeaEstateDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PluckerDto>>> GetPluckers([FromQuery] bool? activeOnly = null)
    {
        var query = _context.Pluckers
            .Include(p => p.Division)
            .AsNoTracking();

        if (activeOnly == true)
        {
            query = query.Where(p => p.IsActive);
        }

        var pluckers = await query
            .OrderBy(p => p.EmployeeCode)
            .Select(p => new PluckerDto(
                p.Id,
                p.EstateId,
                p.DivisionId,
                p.Division != null ? p.Division.Name : null,
                p.EmployeeCode,
                p.FullName,
                p.IsActive
            ))
            .ToListAsync();

        return Ok(pluckers);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,EstateManager,FieldSupervisor")]
    public async Task<ActionResult<PluckerDto>> RegisterPlucker([FromBody] CreatePluckerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            return BadRequest(new { message = "Employee plucker code is required." });
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Full name is required." });
        }

        var estate = await _context.Estates.FirstOrDefaultAsync();
        if (estate == null) return BadRequest(new { message = "Estate not configured." });

        var exists = await _context.Pluckers.AnyAsync(p => p.EstateId == estate.Id && p.EmployeeCode.ToLower() == request.EmployeeCode.Trim().ToLower());
        if (exists)
        {
            return Conflict(new { message = $"Plucker with code '{request.EmployeeCode}' already registered." });
        }

        var plucker = new Plucker
        {
            EstateId = estate.Id,
            DivisionId = request.DivisionId,
            EmployeeCode = request.EmployeeCode.Trim().ToUpperInvariant(),
            FullName = request.FullName.Trim(),
            IsActive = true
        };

        _context.Pluckers.Add(plucker);
        await _context.SaveChangesAsync();

        return Ok(new PluckerDto(
            plucker.Id,
            plucker.EstateId,
            plucker.DivisionId,
            null,
            plucker.EmployeeCode,
            plucker.FullName,
            plucker.IsActive
        ));
    }
}
