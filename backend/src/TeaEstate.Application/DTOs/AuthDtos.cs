using System;

namespace TeaEstate.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    Guid UserId,
    string Email,
    string FullName,
    string Role,
    Guid? EstateId,
    string EstateName
);

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    Guid? EstateId,
    bool IsActive
);
