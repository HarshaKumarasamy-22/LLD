using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TeaEstate.Application.Common.Interfaces;

namespace TeaEstate.Infrastructure.Identity;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;

    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Guid userId, string email, string fullName, IEnumerable<string> roles, Guid? estateId)
    {
        var secret = _config["JWT_SECRET"] ?? _config["JwtSettings:Secret"] ?? "default_very_secure_secret_key_with_at_least_32_characters_long!";
        var issuer = _config["JWT_ISSUER"] ?? _config["JwtSettings:Issuer"] ?? "TeaEstateApi";
        var audience = _config["JWT_AUDIENCE"] ?? _config["JwtSettings:Audience"] ?? "TeaEstateClient";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new("fullName", fullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (estateId.HasValue)
        {
            claims.Add(new Claim("estateId", estateId.Value.ToString()));
        }

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
