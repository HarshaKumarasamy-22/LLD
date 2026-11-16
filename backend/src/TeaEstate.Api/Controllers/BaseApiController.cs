using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TeaEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid? CurrentUserId
    {
        get
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    protected Guid? CurrentEstateId
    {
        get
        {
            var estateId = User.FindFirstValue("estateId");
            return Guid.TryParse(estateId, out var id) ? id : null;
        }
    }
}
