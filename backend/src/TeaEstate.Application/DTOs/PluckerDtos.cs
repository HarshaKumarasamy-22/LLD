using System;

namespace TeaEstate.Application.DTOs;

public record PluckerDto(
    Guid Id,
    Guid EstateId,
    Guid? DivisionId,
    string? DivisionName,
    string EmployeeCode,
    string FullName,
    bool IsActive
);

public record CreatePluckerRequest(
    Guid? DivisionId,
    string EmployeeCode,
    string FullName
);
