// fileName: Backend/Controllers/ApplicationController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentBackend.Services;
using System;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace RecruitmentBackend.Controllers
{
    [ApiController]
    [Route("api/companies/{companyId}/applications")]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationService _applicationService;
        private readonly ITenantContext _tenant;

        public ApplicationsController(ApplicationService applicationService, ITenantContext tenant)
        {
            _applicationService = applicationService;
            _tenant = tenant;
        }

        [HttpPost("{positionCode}")]
        public async Task<IActionResult> Apply(string companyId, string positionCode)
        {
            var userId = _tenant.UserId;
            var tenantCompanyId = _tenant.CompanyId;

            if (userId == Guid.Empty)
                return Unauthorized(new { Message = "Invalid user session." });

            if (string.IsNullOrEmpty(companyId))
                return BadRequest(new { Message = "Company context is missing from URL." });

            if (!string.Equals(companyId, tenantCompanyId, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            try
            {
                await _applicationService.ApplyAsync(userId, positionCode, companyId);
                return Ok(new { Message = "Application submitted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Apply Error: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while processing your application." });
            }
        }

        [HttpPut("{candidateId}/{positionCode}/export-status")]
        public async Task<IActionResult> UpdateExportStatus(string companyId, string candidateId, string positionCode, [FromBody] ExportStatusUpdateDto request)
        {
            try
            {
                var success = await _applicationService.UpdateExportStatusAsync(candidateId, companyId, positionCode, request.ExportStatus);
                
                if (!success) return NotFound(new { Message = "Application not found." });
                
                return Ok(new { Message = "Export status updated successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Export Status Update Error: {ex.Message}");
                return StatusCode(500, new { Message = "An error occurred while updating the export status." });
            }
        }
    }

    public class ExportStatusUpdateDto
    {
        // FIXED: Maps exactly to what React is sending, preventing the 400 Bad Request
        [JsonPropertyName("exportStatus")]
        public string ExportStatus { get; set; } = string.Empty;
    }
}