using System;

namespace TeaEstate.Application.DTOs;

// --- Fertilizer ---
public record FertilizerTypeDto(Guid Id, string Name, bool IsActive);

public record FertilizerApplicationDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    string FieldName,
    Guid FertilizerTypeId,
    string FertilizerTypeName,
    DateOnly ApplicationDate,
    decimal QuantityKg,
    string? Method,
    string? Notes
);

public record RecordFertilizerRequest(
    Guid FieldId,
    Guid FertilizerTypeId,
    DateOnly ApplicationDate,
    decimal QuantityKg,
    string? Method,
    string? Notes
);

// --- Soil pH ---
public record SoilPHRecordDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly TestedDate,
    decimal PHValue,
    string? SampleRef,
    string? TesterName,
    string? Notes,
    bool IsOptimal
);

public record RecordSoilPHRequest(
    Guid FieldId,
    DateOnly TestedDate,
    decimal PHValue,
    string? SampleRef,
    string? TesterName,
    string? Notes
);

public record FieldLatestSoilPHDto(
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly? LatestTestedDate,
    decimal? LatestPHValue,
    bool? IsOptimal
);

// --- Weeding ---
public record WeedingActivityDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly PlannedDate,
    DateOnly? CompletedDate,
    string? Method,
    string? ResponsiblePerson,
    string? Notes,
    string Status // Planned, Completed, Overdue
);

public record CreateWeedingPlanRequest(
    Guid FieldId,
    DateOnly PlannedDate,
    string? Method,
    string? Notes
);

public record CompleteWeedingRequest(
    DateOnly CompletedDate,
    string? ResponsiblePerson,
    string? Notes
);

// --- Pruning ---
public record PruningRecordDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly PruningDate,
    string? PruningType,
    string? Notes
);

public record RecordPruningRequest(
    Guid FieldId,
    DateOnly PruningDate,
    string? PruningType,
    string? Notes
);

public record FieldPruningSummaryDto(
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly? LastPruningDate,
    string? LastPruningType,
    int TotalPruningCount
);
