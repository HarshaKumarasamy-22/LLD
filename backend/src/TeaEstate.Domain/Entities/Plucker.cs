using System;
using System.Collections.Generic;
using TeaEstate.Domain.Common;

namespace TeaEstate.Domain.Entities;

public class Plucker : BaseEntity
{
    public Guid EstateId { get; set; }
    public Estate? Estate { get; set; }

    public Guid? DivisionId { get; set; }
    public Division? Division { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<PluckerIntake> PluckerIntakes { get; set; } = new List<PluckerIntake>();
}
