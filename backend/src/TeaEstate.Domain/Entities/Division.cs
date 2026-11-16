using System;
using System.Collections.Generic;
using TeaEstate.Domain.Common;

namespace TeaEstate.Domain.Entities;

public class Division : BaseEntity
{
    public Guid EstateId { get; set; }
    public Estate? Estate { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public ICollection<Field> Fields { get; set; } = new List<Field>();
}
