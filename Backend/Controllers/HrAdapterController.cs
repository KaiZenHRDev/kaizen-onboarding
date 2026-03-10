// fileName: Controllers/HrAdapterController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace RecruitmentBackend.Controllers
{
    // A simple DTO to bypass strict entity model validation
    public class HrAdapterSaveRequest
    {
        [JsonPropertyName("formDataJson")]
        public string FormDataJson { get; set; } = string.Empty;
    }

    [Authorize]
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class HrAdapterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HrAdapterController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/companies/{companyId}/HrAdapter/{candidateId}
        [HttpGet("{candidateId}")]
        public async Task<IActionResult> Get(string companyId, string candidateId)
        {
            var data = await _context.HrAdapterData
                .FirstOrDefaultAsync(h => h.CompanyId == companyId && h.CandidateId == candidateId);
            
            // Return Ok(new { }) instead of Ok(null) to prevent 204 No Content crashing res.json()
            if (data == null) return Ok(new { });
            
            return Ok(data);
        }

        // POST: api/companies/{companyId}/HrAdapter/{candidateId}
        [HttpPost("{candidateId}")]
        public async Task<IActionResult> Save(string companyId, string candidateId, [FromBody] HrAdapterSaveRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.FormDataJson))
            {
                return BadRequest("FormDataJson payload is missing or invalid.");
            }

            var existing = await _context.HrAdapterData
                .FirstOrDefaultAsync(h => h.CompanyId == companyId && h.CandidateId == candidateId);

            if (existing != null)
            {
                existing.FormDataJson = request.FormDataJson;
                _context.HrAdapterData.Update(existing);
            }
            else
            {
                var newRecord = new HrAdapterData
                {
                    CompanyId = companyId,
                    CandidateId = candidateId,
                    FormDataJson = request.FormDataJson
                };
                _context.HrAdapterData.Add(newRecord);
            }

            // --- FIXED: Find internal Guid using the string CandidateId ---
            var candidateGuid = await _context.Candidates
                .Where(c => c.CandidateId == candidateId)
                .Select(c => c.Id)
                .FirstOrDefaultAsync();

            if (candidateGuid != Guid.Empty)
            {
                var applications = await _context.Applications
                    .Where(a => a.CompanyId == companyId && a.CandidateId == candidateGuid)
                    .ToListAsync();

                foreach (var app in applications)
                {
                    // Only update it if it hasn't already been marked as fully "Exported"
                    if (app.ExportStatus != "Exported")
                    {
                        app.ExportStatus = "Profile Updated";
                        app.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "HR Adapter Data saved and Export Status updated successfully" });
        }
    }
}