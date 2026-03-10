// fileName: Backend/Services/TenantContext.cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing; // Required for RouteValues
using System;
using System.Security.Claims;

namespace RecruitmentBackend.Services
{
    public class TenantContext : ITenantContext
    {
        public string? CompanyId { get; }
        public string Role { get; }
        public Guid UserId { get; }

        public TenantContext(IHttpContextAccessor accessor)
        {
            var context = accessor.HttpContext;
            var user = context?.User;

            // 1. Extract Role & UserID
            Role = user?.FindFirst("Role")?.Value ?? "";
            
            var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out Guid parsedId))
                UserId = parsedId;
            else
                UserId = Guid.Empty;

            // --- TENANT RESOLUTION LOGIC ---

            // RULE 1: INTERNAL USERS (Admin, HR, etc.)
            // Trust ONLY the JWT. They cannot "impersonate" via route.
            if (Role == "Admin" || Role == "HR" || Role == "Interviewer")
            {
                CompanyId = user?.FindFirst("CompanyId")?.Value;
            }
            // RULE 2: CANDIDATES / PUBLIC
            // Trust ONLY the Explicit Route Parameter.
            else
            {
                if (context != null && context.Request.RouteValues.TryGetValue("companyId", out var routeVal))
                {
                    CompanyId = routeVal?.ToString();
                }
                else
                {
                    CompanyId = null; // No context found
                }
            }
        }
    }
}