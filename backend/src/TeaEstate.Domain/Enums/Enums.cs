namespace TeaEstate.Domain.Enums;

public enum UserRole
{
    Administrator,
    EstateManager,
    FieldSupervisor,
    DataEntry
}

public enum RecordStatus
{
    Recorded,
    Corrected,
    Draft,
    Submitted,
    Verified
}
