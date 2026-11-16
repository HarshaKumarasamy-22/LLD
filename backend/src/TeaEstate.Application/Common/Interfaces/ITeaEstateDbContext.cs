using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TeaEstate.Domain.Entities;

namespace TeaEstate.Application.Common.Interfaces;

public interface ITeaEstateDbContext
{
    DbSet<Estate> Estates { get; }
    DbSet<Division> Divisions { get; }
    DbSet<Field> Fields { get; }
    DbSet<Plucker> Pluckers { get; }
    DbSet<FieldWeight> FieldWeights { get; }
    DbSet<PluckerIntake> PluckerIntakes { get; }
    DbSet<FertilizerType> FertilizerTypes { get; }
    DbSet<FertilizerApplication> FertilizerApplications { get; }
    DbSet<SoilPHRecord> SoilPHRecords { get; }
    DbSet<WeedingActivity> WeedingActivities { get; }
    DbSet<PruningRecord> PruningRecords { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
