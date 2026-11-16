using System;
using TeaEstate.Domain.Common;
using TeaEstate.Domain.Enums;

namespace TeaEstate.Domain.Entities;

public class PluckerIntake : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public Guid PluckerId { get; set; }
    public Plucker? Plucker { get; set; }

    public DateOnly IntakeDate { get; set; }
    public string? Session { get; set; }
    public decimal WeightKg { get; set; }
    public string? Notes { get; set; }
    public RecordStatus Status { get; set; } = RecordStatus.Recorded;

    public Guid? CreatedByUserId { get; set; }
}
