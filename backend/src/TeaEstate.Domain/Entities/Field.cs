using System;
using System.Collections.Generic;
using TeaEstate.Domain.Common;

namespace TeaEstate.Domain.Entities;

public class Field : BaseEntity
{
    public Guid EstateId { get; set; }
    public Estate? Estate { get; set; }

    public Guid? DivisionId { get; set; }
    public Division? Division { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    // Navigation collections
    public ICollection<FieldWeight> FieldWeights { get; set; } = new List<FieldWeight>();
    public ICollection<PluckerIntake> PluckerIntakes { get; set; } = new List<PluckerIntake>();
    public ICollection<FertilizerApplication> FertilizerApplications { get; set; } = new List<FertilizerApplication>();
    public ICollection<SoilPHRecord> SoilPHRecords { get; set; } = new List<SoilPHRecord>();
    public ICollection<WeedingActivity> WeedingActivities { get; set; } = new List<WeedingActivity>();
    public ICollection<PruningRecord> PruningRecords { get; set; } = new List<PruningRecord>();
}
