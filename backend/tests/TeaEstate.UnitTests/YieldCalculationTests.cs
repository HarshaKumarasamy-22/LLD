using System;
using System.Collections.Generic;
using TeaEstate.Application.Services;
using Xunit;

namespace TeaEstate.UnitTests;

public class YieldCalculationTests
{
    private readonly YieldCalculationService _calculator = new();

    [Fact]
    public void AC03_MtdCalculation_ShouldSumCorrectlyWithinMonth()
    {
        // Given Field A has 320, 280 and 300 kg in one month, MTD through third date equals 900 kg
        var entries = new List<(DateOnly Date, decimal WeightKg)>
        {
            (new DateOnly(2026, 11, 2), 320m),
            (new DateOnly(2026, 11, 5), 280m),
            (new DateOnly(2026, 11, 10), 300m),
            (new DateOnly(2026, 11, 15), 150m) // After cutoff date
        };

        var cutoffDate = new DateOnly(2026, 11, 10);
        var mtd = _calculator.CalculateMtd(entries, cutoffDate);

        Assert.Equal(900m, mtd);
    }

    [Fact]
    public void MtdCalculation_ShouldIgnoreEntriesFromPreviousMonth()
    {
        var entries = new List<(DateOnly Date, decimal WeightKg)>
        {
            (new DateOnly(2026, 10, 31), 400m), // Previous month
            (new DateOnly(2026, 11, 1), 250m),
            (new DateOnly(2026, 11, 2), 350m)
        };

        var cutoffDate = new DateOnly(2026, 11, 5);
        var mtd = _calculator.CalculateMtd(entries, cutoffDate);

        Assert.Equal(600m, mtd);
    }

    [Fact]
    public void AC05_DailyVariance_ShouldShowCorrectNegativeVarianceAndPercentage()
    {
        // Given field weight 60 kg and total plucker intake 55 kg
        // Variance = 55 - 60 = -5 kg, Percentage = (-5 / 60) * 100 = -8.33%
        decimal fieldWeight = 60m;
        decimal pluckerIntake = 55m;

        var (varianceKg, percentage) = _calculator.CalculateDailyVariance(fieldWeight, pluckerIntake);

        Assert.Equal(-5m, varianceKg);
        Assert.NotNull(percentage);
        Assert.Equal(-8.33m, percentage.Value);
    }

    [Fact]
    public void DailyVariance_WhenFieldWeightIsZero_ShouldReturnNullPercentage()
    {
        decimal fieldWeight = 0m;
        decimal pluckerIntake = 30m;

        var (varianceKg, percentage) = _calculator.CalculateDailyVariance(fieldWeight, pluckerIntake);

        Assert.Equal(30m, varianceKg);
        Assert.Null(percentage);
    }

    [Fact]
    public void YieldPerHectare_ShouldCalculateAccurately()
    {
        decimal totalWeight = 1500m;
        decimal hectares = 3.5m;

        var yieldPerHa = _calculator.CalculateYieldPerHectare(totalWeight, hectares);

        Assert.Equal(428.57m, yieldPerHa);
    }
}
