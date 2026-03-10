// fileName: Backend/Controllers/EmploymentHistoryController.cs
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
    public class EmploymentHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public EmploymentHistoryController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        private async Task<Guid?> ResolveCandidateGuid(string candidateId)
        {
            // 1. If it's already a Guid string, return it.
            if (Guid.TryParse(candidateId, out Guid guid)) return guid;

            // 2. If it's "CAND001", find the Guid in the database.
            var candidate = await _context.Candidates
                .AsNoTracking()
                .Select(c => new { c.Id, c.CandidateId })
                .FirstOrDefaultAsync(c => c.CandidateId == candidateId);

            return candidate?.Id;
        }

        // GET: api/companies/{companyId}/EmploymentHistory/{candidateId}
        [HttpGet("{candidateId}")]
        public async Task<ActionResult<IEnumerable<EmploymentHistory>>> GetEmploymentHistory(string candidateId)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            Guid targetGuid;
            
            if (Guid.TryParse(candidateId, out Guid parsedGuid))
            {
                targetGuid = parsedGuid;
            }
            else
            {
                var candidate = await _context.Candidates
                    .Select(c => new { c.Id, c.CandidateId })
                    .FirstOrDefaultAsync(c => c.CandidateId == candidateId);

                if (candidate == null) return NotFound(new { message = "Candidate not found." });
                targetGuid = candidate.Id;
            }

            var history = await _context.EmploymentHistories
                .Where(h => h.CandidateId == targetGuid) 
                .OrderByDescending(h => h.FromDate)
                .ToListAsync();

            return Ok(history);
        }

        // POST: api/companies/{companyId}/EmploymentHistory?candidateId=CAND001
        [HttpPost]
        public async Task<IActionResult> SaveEmploymentHistory(
            [FromQuery] string candidateId, // ✅ FIX: Receive ID from URL
            [FromBody] List<EmploymentHistory> records)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            // 1. Resolve String ID to Guid
            var targetGuid = await ResolveCandidateGuid(candidateId);
            
            if (targetGuid == null || targetGuid == Guid.Empty)
            {
                 return BadRequest(new { message = $"Candidate not found for ID: {candidateId}" });
            }

            // 2. Clear Validation errors for CandidateId (set manually below)
            ModelState.Remove("CandidateId");
            ModelState.Remove(nameof(EmploymentHistory.CandidateId));

            if (records == null || !records.Any()) return Ok(new { message = "No records to save." });

            // 3. Duplicate Checks
            var duplicateIndustries = records
                .Where(r => !string.IsNullOrEmpty(r.IndustryCode))
                .GroupBy(r => r.IndustryCode)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateIndustries.Any())
                return BadRequest(new { message = $"Duplicate detected: Industry Code '{duplicateIndustries.First()}'" });

            var duplicateJobs = records
                .Where(r => !string.IsNullOrEmpty(r.JobCode))
                .GroupBy(r => r.JobCode)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateJobs.Any())
                return BadRequest(new { message = $"Duplicate detected: Job Code '{duplicateJobs.First()}'" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 4. Get existing records
                var existingRecords = await _context.EmploymentHistories
                    .Where(h => h.CandidateId == targetGuid)
                    .ToListAsync();

                if (existingRecords.Any())
                {
                    _context.EmploymentHistories.RemoveRange(existingRecords);
                }

                // 5. Insert new records
                foreach (var record in records)
                {
                    record.Id = 0;
                    if (record.EmployerName == null) record.EmployerName = "";
                    if (record.JobCode == null) record.JobCode = "";

                    // ✅ FIX: Force resolved GUID
                    record.CandidateId = targetGuid.Value; 
                }

                await _context.EmploymentHistories.AddRangeAsync(records);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(records);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while saving data.", error = ex.Message });
            }
        }
    }
}