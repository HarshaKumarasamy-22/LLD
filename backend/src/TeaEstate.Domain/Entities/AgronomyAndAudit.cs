using System;
using System.Collections.Generic;
using TeaEstate.Domain.Common;

namespace TeaEstate.Domain.Entities;

public class FertilizerType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<FertilizerApplication> Applications { get; set; } = new List<FertilizerApplication>();
}

public class FertilizerApplication : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public Guid FertilizerTypeId { get; set; }
    public FertilizerType? FertilizerType { get; set; }

    public DateOnly ApplicationDate { get; set; }
    public decimal QuantityKg { get; set; }
    public string? Method { get; set; }
    public string? Notes { get; set; }
}

public class SoilPHRecord : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public DateOnly TestedDate { get; set; }
    public decimal PHValue { get; set; }
    public string? SampleRef { get; set; }
    public string? TesterName { get; set; }
    public string? Notes { get; set; }
}

public class WeedingActivity : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public DateOnly PlannedDate { get; set; }
    public DateOnly? CompletedDate { get; set; }
    public string? Method { get; set; }
    public string? ResponsiblePerson { get; set; }
    public string? Notes { get; set; }
}

public class PruningRecord : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public DateOnly PruningDate { get; set; }
    public string? PruningType { get; set; }
    public string? Notes { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? ActorUserId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? BeforeJson { get; set; }
    public string? AfterJson { get; set; }
    public DateTime AtUtc { get; set; } = DateTime.UtcNow;
}
