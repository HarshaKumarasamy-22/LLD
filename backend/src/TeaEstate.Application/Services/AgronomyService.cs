using System;

namespace TeaEstate.Application.Services;

public interface IAgronomyService
{
    string DeriveWeedingStatus(DateOnly plannedDate, DateOnly? completedDate, DateOnly referenceDate);
    bool IsOptimalSoilPH(decimal phValue, decimal minAdvisory = 4.5m, decimal maxAdvisory = 5.5m);
}

public class AgronomyService : IAgronomyService
{
    public string DeriveWeedingStatus(DateOnly plannedDate, DateOnly? completedDate, DateOnly referenceDate)
    {
        if (completedDate.HasValue)
        {
            return "Completed";
        }

        if (plannedDate < referenceDate)
        {
            return "Overdue";
        }

        return "Planned";
    }

    public bool IsOptimalSoilPH(decimal phValue, decimal minAdvisory = 4.5m, decimal maxAdvisory = 5.5m)
    {
        return phValue >= minAdvisory && phValue <= maxAdvisory;
    }
}
