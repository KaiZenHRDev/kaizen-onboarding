// fileName: Backend/Controllers/QualificationController.cs
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
    // 1. UPDATE ROUTE: Includes {companyId}
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class QualificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public QualificationController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        // ✅ HELPER: Resolves "CAND001" (String) OR "Guid-String" to a pure Guid
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

        // GET: api/companies/{companyId}/Qualification/{candidateId}
        [HttpGet("{candidateId}")]
        public async Task<IActionResult> GetQualifications(string candidateId)
        {
            // 3. SECURE GET: Use Tenant Context (Still needed for session validity)
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId))
            {
                return BadRequest(new { message = "Company Context is missing." });
            }

            // 1. Resolve to Guid
            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return NotFound(new { message = "Candidate not found." });

            // DATA ISOLATION: Filter by CandidateId only (Global Profile)
            var qualifications = await _context.Qualifications
                .Where(q => q.CandidateId == targetGuid.Value) // ✅ Guid Comparison
                .OrderBy(q => q.SinceWhenDate)
                .ToListAsync();

            return Ok(qualifications ?? new List<Qualification>());
        }

        // POST: api/companies/{companyId}/Qualification
        [HttpPost]
        public async Task<IActionResult> SaveQualifications(
            [FromQuery] string candidateId, // ✅ FIX 1: Accept ID from URL
            [FromBody] List<Qualification> submittedQualifications)
        {
            // 4. SECURE POST: Get ID from secure context
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId))
            {
                return BadRequest(new { message = "Company Context is missing." });
            }

            // ✅ FIX 2: Resolve the Candidate GUID using the Query Parameter
            var targetGuid = await ResolveCandidateGuid(candidateId);
            
            if (targetGuid == null || targetGuid == Guid.Empty)
            {
                 return BadRequest(new { message = $"Candidate not found for ID: {candidateId}" });
            }

            // ✅ FIX 3: Clear validation errors for CandidateId (since we set it manually later)
            ModelState.Remove("CandidateId");
            foreach (var key in ModelState.Keys.Where(k => k.Contains("CandidateId")).ToList())
            {
                ModelState.Remove(key);
            }

            if (submittedQualifications == null || !submittedQualifications.Any())
            {
                return Ok(new List<Qualification>());
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Get existing records (Global Scope)
                    var existingQualifications = await _context.Qualifications
                        .Where(q => q.CandidateId == targetGuid) // ✅ Guid Comparison
                        .ToListAsync();

                    // 2. Duplicate Check
                    foreach (var submittedQual in submittedQualifications)
                    {
                        string subCode = submittedQual.QualificationSubCode ?? string.Empty;
                        string gradeCode = submittedQual.QualificationGradeCode ?? string.Empty;

                        var isDuplicate = existingQualifications.Any(dbQual => 
                            dbQual.Id != submittedQual.Id && 
                            (dbQual.QualificationSubCode ?? string.Empty) == subCode &&
                            (dbQual.QualificationGradeCode ?? string.Empty) == gradeCode
                        );

                        if (isDuplicate)
                        {
                            return BadRequest(new { 
                                message = $"Duplicate detected: Sub-Code '{subCode}' and Grade '{gradeCode}' already exists." 
                            });
                        }
                    }

                    // 3. Identify and Delete removed items
                    var idsToKeep = submittedQualifications.Select(s => s.Id).Where(id => id != 0).ToList();
                    
                    var qualificationsToDelete = existingQualifications
                        .Where(eq => !idsToKeep.Contains(eq.Id))
                        .ToList();

                    if (qualificationsToDelete.Any())
                    {
                        _context.Qualifications.RemoveRange(qualificationsToDelete);
                    }

                    // 4. Insert or Update
                    foreach (var submittedQual in submittedQualifications)
                    {
                        // ✅ FIX 4: Force the resolved Guid onto every record
                        submittedQual.CandidateId = targetGuid.Value; 

                        if (submittedQual.Id == 0)
                        {
                            // INSERT
                            submittedQual.CreatedAt = DateTime.UtcNow;
                            _context.Qualifications.Add(submittedQual);
                        }
                        else
                        {
                            // UPDATE - Find within the PRE-FETCHED existing list
                            var existingQual = existingQualifications.FirstOrDefault(eq => eq.Id == submittedQual.Id);
                            
                            if (existingQual != null)
                            {
                                // Copy values securely
                                _context.Entry(existingQual).CurrentValues.SetValues(submittedQual);
                                
                                // Re-assert Key Fields
                                existingQual.CandidateId = targetGuid.Value;
                                existingQual.UpdatedAt = DateTime.UtcNow;
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // 5. Return latest state (Global)
                    var finalQualifications = await _context.Qualifications
                        .Where(q => q.CandidateId == targetGuid)
                        .OrderBy(q => q.SinceWhenDate)
                        .ToListAsync();

                    return Ok(finalQualifications);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "An error occurred while saving qualifications.", error = ex.Message });
                }
            }
        }
    }
}