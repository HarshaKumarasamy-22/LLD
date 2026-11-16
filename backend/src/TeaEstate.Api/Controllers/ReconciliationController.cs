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

namespace TeaEstate.Api.Controllers;

[Authorize]
public class ReconciliationController : BaseApiController
{
    private readonly ITeaEstateDbContext _context;
    private readonly IYieldCalculationService _calculator;

    public ReconciliationController(ITeaEstateDbContext context, IYieldCalculationService calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyReconciliationItem>>> GetReconciliation(
        [FromQuery] DateOnly? date = null,
        [FromQuery] Guid? fieldId = null)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var fieldsQuery = _context.Fields.AsNoTracking();
        if (fieldId.HasValue)
        {
            fieldsQuery = fieldsQuery.Where(f => f.Id == fieldId.Value);
        }

        var fields = await fieldsQuery.OrderBy(f => f.Code).ToListAsync();

        var fieldWeights = await _context.FieldWeights
            .Where(w => w.WeightDate == targetDate)
            .GroupBy(w => w.FieldId)
            .Select(g => new { FieldId = g.Key, TotalKg = g.Sum(w => w.WeightKg) })
            .ToDictionaryAsync(g => g.FieldId, g => g.TotalKg);

        var pluckerIntakes = await _context.PluckerIntakes
            .Where(i => i.IntakeDate == targetDate)
            .GroupBy(i => i.FieldId)
            .Select(g => new { FieldId = g.Key, TotalKg = g.Sum(i => i.WeightKg) })
            .ToDictionaryAsync(g => g.FieldId, g => g.TotalKg);

        var items = new List<DailyReconciliationItem>();

        foreach (var field in fields)
        {
            var fieldTotal = fieldWeights.GetValueOrDefault(field.Id, 0m);
            var intakeTotal = pluckerIntakes.GetValueOrDefault(field.Id, 0m);

            // Only include fields that have activity for that day, or all fields if explicitly filtered by fieldId
            if (fieldTotal > 0 || intakeTotal > 0 || fieldId.HasValue)
            {
                var (varianceKg, percentage) = _calculator.CalculateDailyVariance(fieldTotal, intakeTotal);

                items.Add(new DailyReconciliationItem(
                    FieldId: field.Id,
                    FieldCode: field.Code,
                    FieldName: field.Name,
                    Date: targetDate,
                    TotalFieldWeightKg: fieldTotal,
                    TotalPluckerIntakeKg: intakeTotal,
                    VarianceKg: varianceKg,
                    VariancePercentage: percentage
                ));
            }
        }

        return Ok(items);
    }
}
