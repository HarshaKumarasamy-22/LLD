using System;
using TeaEstate.Application.Services;
using Xunit;

namespace TeaEstate.UnitTests;

public class AgronomyTests
{
    private readonly AgronomyService _agronomyService = new();

    [Fact]
    public void AC08_WeedingStatus_WhenPlannedDateIsInPastAndNotCompleted_ShouldBeOverdue()
    {
        var plannedDate = new DateOnly(2026, 11, 1);
        DateOnly? completedDate = null;
        var today = new DateOnly(2026, 11, 16);

        var status = _agronomyService.DeriveWeedingStatus(plannedDate, completedDate, today);

        Assert.Equal("Overdue", status);
    }

    [Fact]
    public void AC08_WeedingStatus_WhenCompletedDateIsRecorded_ShouldBeCompleted()
    {
        var plannedDate = new DateOnly(2026, 11, 1);
        var completedDate = new DateOnly(2026, 11, 5);
        var today = new DateOnly(2026, 11, 16);

        var status = _agronomyService.DeriveWeedingStatus(plannedDate, completedDate, today);

        Assert.Equal("Completed", status);
    }

    [Fact]
    public void AC08_WeedingStatus_WhenPlannedDateIsFuture_ShouldBePlanned()
    {
        var plannedDate = new DateOnly(2026, 11, 25);
        DateOnly? completedDate = null;
        var today = new DateOnly(2026, 11, 16);

        var status = _agronomyService.DeriveWeedingStatus(plannedDate, completedDate, today);

        Assert.Equal("Planned", status);
    }

    [Theory]
    [InlineData(4.5, true)]
    [InlineData(5.0, true)]
    [InlineData(5.5, true)]
    [InlineData(4.2, false)]
    [InlineData(6.2, false)]
    public void AC07_SoilPH_ShouldCorrectlyIdentifyOptimalAdvisoryRange(decimal ph, bool expectedOptimal)
    {
        var isOptimal = _agronomyService.IsOptimalSoilPH(ph);
        Assert.Equal(expectedOptimal, isOptimal);
    }
}
