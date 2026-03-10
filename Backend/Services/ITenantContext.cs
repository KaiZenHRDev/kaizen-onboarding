// fileName: Backend/Services/ITenantContext.cs
using System;

namespace RecruitmentBackend.Services
{
    public interface ITenantContext
    {
        string? CompanyId { get; }
        string Role { get; }
        Guid UserId { get; }
    }
}