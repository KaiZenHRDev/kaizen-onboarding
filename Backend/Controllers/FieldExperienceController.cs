// fileName: Backend/Controllers/FieldExperienceController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecruitmentBackend.Controllers
{
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class FieldExperienceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public FieldExperienceController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        private async Task<Guid?> ResolveCandidateGuid(string candidateId)
        {
            if (Guid.TryParse(candidateId, out Guid guid)) return guid;

            var candidate = await _context.Candidates
                .AsNoTracking()
                .Select(c => new { c.Id, c.CandidateId })
                .FirstOrDefaultAsync(c => c.CandidateId == candidateId);

            return candidate?.Id;
        }

        [HttpGet("{candidateId}")]
        public async Task<ActionResult<IEnumerable<FieldExperience>>> GetFieldExperience(string candidateId)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return NotFound(new { message = "Candidate not found." });

            var experience = await _context.FieldExperiences
                .Where(e => e.CandidateId == targetGuid.Value)
                .ToListAsync();

            return Ok(experience);
        }

        [HttpPost]
        public async Task<IActionResult> SaveFieldExperience(
            [FromQuery] string candidateId, 
            [FromBody] List<FieldExperience> experiences)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company context missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null || targetGuid == Guid.Empty)
                return BadRequest(new { message = $"Candidate not found: {candidateId}" });

            // ✅ FIX: Manually clear CandidateId validation errors (handles string vs Guid mismatch)
            ModelState.Remove("CandidateId");
            foreach (var key in ModelState.Keys.Where(k => k.Contains("CandidateId")).ToList())
                ModelState.Remove(key);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existing = await _context.FieldExperiences.Where(e => e.CandidateId == targetGuid.Value).ToListAsync();
                if (existing.Any()) _context.FieldExperiences.RemoveRange(existing);

                foreach (var exp in experiences)
                {
                    exp.Id = 0; 
                    exp.CandidateId = targetGuid.Value; // ✅ Force GUID assignment
                    
                    // Safety check for nulls
                    exp.FieldName ??= "";
                    exp.Description ??= "";
                    exp.FieldAreaCode ??= "";
                }

                await _context.FieldExperiences.AddRangeAsync(experiences);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Successfully saved records." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Server error.", error = ex.Message });
            }
        }
    }
}