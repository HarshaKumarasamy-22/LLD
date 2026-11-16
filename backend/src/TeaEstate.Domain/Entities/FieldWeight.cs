using System;
using TeaEstate.Domain.Common;
using TeaEstate.Domain.Enums;

namespace TeaEstate.Domain.Entities;

public class FieldWeight : BaseEntity
{
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }

    public DateOnly WeightDate { get; set; }
    public string? Session { get; set; }
    public decimal WeightKg { get; set; }
    public string? Notes { get; set; }
    public RecordStatus Status { get; set; } = RecordStatus.Recorded;

    public Guid? CreatedByUserId { get; set; }
}
