using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeaEstate.Application.Common.Interfaces;
using TeaEstate.Application.DTOs;
using TeaEstate.Infrastructure.Identity;

namespace TeaEstate.Api.Controllers;

public class AuthController : BaseApiController
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ITeaEstateDbContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenGenerator jwtTokenGenerator,
        ITeaEstateDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _context = context;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Invalid email or account is inactive." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "DataEntry";
        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.Email!, user.FullName, roles, user.EstateId);

        var estateName = "Tea Estate";
        if (user.EstateId.HasValue)
        {
            var estate = await _context.Estates.FindAsync(user.EstateId.Value);
            if (estate != null) estateName = estate.Name;
        }

        return Ok(new LoginResponse(
            Token: token,
            UserId: user.Id,
            Email: user.Email!,
            FullName: user.FullName,
            Role: primaryRole,
            EstateId: user.EstateId,
            EstateName: estateName
        ));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDto(
            Id: user.Id,
            Email: user.Email!,
            FullName: user.FullName,
            Role: roles.FirstOrDefault() ?? "DataEntry",
            EstateId: user.EstateId,
            IsActive: user.IsActive
        ));
    }
}
