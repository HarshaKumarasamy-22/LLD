using System;
using System.Collections.Generic;

namespace TeaEstate.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(Guid userId, string email, string fullName, IEnumerable<string> roles, Guid? estateId);
}
