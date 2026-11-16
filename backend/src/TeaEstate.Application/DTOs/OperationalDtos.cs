using System;

namespace TeaEstate.Application.DTOs;

public record FieldWeightDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly WeightDate,
    string? Session,
    decimal WeightKg,
    string? Notes,
    string Status
);

public record RecordFieldWeightRequest(
    Guid FieldId,
    DateOnly WeightDate,
    string? Session,
    decimal WeightKg,
    string? Notes
);

public record FieldMtdSummaryDto(
    Guid FieldId,
    string FieldCode,
    string FieldName,
    int Year,
    int Month,
    DateOnly CutoffDate,
    decimal MtdWeightKg,
    int TotalEntries
);

public record PluckerIntakeDto(
    Guid Id,
    Guid FieldId,
    string FieldCode,
    Guid PluckerId,
    string PluckerCode,
    string PluckerName,
    DateOnly IntakeDate,
    string? Session,
    decimal WeightKg,
    string? Notes,
    string Status
);

public record RecordPluckerIntakeRequest(
    Guid FieldId,
    Guid PluckerId,
    DateOnly IntakeDate,
    string? Session,
    decimal WeightKg,
    string? Notes
);

public record DailyReconciliationItem(
    Guid FieldId,
    string FieldCode,
    string FieldName,
    DateOnly Date,
    decimal TotalFieldWeightKg,
    decimal TotalPluckerIntakeKg,
    decimal VarianceKg,
    decimal? VariancePercentage
);
