using System;
using System.Collections.Generic;
using System.Linq;

namespace TeaEstate.Application.Services;

public interface IYieldCalculationService
{
    decimal CalculateMtd(IEnumerable<(DateOnly Date, decimal WeightKg)> entries, DateOnly cutoffDate);
    (decimal VarianceKg, decimal? VariancePercentage) CalculateDailyVariance(decimal totalFieldWeightKg, decimal totalPluckerIntakeKg);
    decimal CalculateYieldPerHectare(decimal totalWeightKg, decimal areaHectares);
}

public class YieldCalculationService : IYieldCalculationService
{
    public decimal CalculateMtd(IEnumerable<(DateOnly Date, decimal WeightKg)> entries, DateOnly cutoffDate)
    {
        var firstDayOfMonth = new DateOnly(cutoffDate.Year, cutoffDate.Month, 1);

        return entries
            .Where(e => e.Date >= firstDayOfMonth && e.Date <= cutoffDate)
            .Sum(e => e.WeightKg);
    }

    public (decimal VarianceKg, decimal? VariancePercentage) CalculateDailyVariance(decimal totalFieldWeightKg, decimal totalPluckerIntakeKg)
    {
        // Daily variance = total plucker intake - total field weight (per SRS 5.3)
        var varianceKg = totalPluckerIntakeKg - totalFieldWeightKg;

        if (totalFieldWeightKg > 0)
        {
            var percentage = Math.Round((varianceKg / totalFieldWeightKg) * 100m, 2);
            return (varianceKg, percentage);
        }

        return (varianceKg, null);
    }

    public decimal CalculateYieldPerHectare(decimal totalWeightKg, decimal areaHectares)
    {
        if (areaHectares <= 0) return 0m;
        return Math.Round(totalWeightKg / areaHectares, 2);
    }
}
