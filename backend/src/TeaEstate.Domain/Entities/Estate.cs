using System;
using System.Collections.Generic;
using TeaEstate.Domain.Common;

namespace TeaEstate.Domain.Entities;

public class Estate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "Asia/Colombo";

    // Navigation properties
    public ICollection<Division> Divisions { get; set; } = new List<Division>();
    public ICollection<Field> Fields { get; set; } = new List<Field>();
    public ICollection<Plucker> Pluckers { get; set; } = new List<Plucker>();
}
