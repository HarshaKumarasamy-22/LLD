using System;

namespace TeaEstate.Application.DTOs;

public record FieldDto(
    Guid Id,
    Guid EstateId,
    Guid? DivisionId,
    string? DivisionName,
    string Code,
    string Name,
    decimal AreaHectares,
    bool IsActive,
    string? Notes
);

public record CreateFieldRequest(
    Guid? DivisionId,
    string Code,
    string Name,
    decimal AreaHectares,
    string? Notes
);

public record UpdateFieldRequest(
    Guid? DivisionId,
    string Name,
    decimal AreaHectares,
    bool IsActive,
    string? Notes
);
