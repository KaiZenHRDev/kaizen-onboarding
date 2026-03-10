// fileName: Backend/Controllers/HobbyLanguageController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Services; 
using System.Text.Json;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace RecruitmentBackend.Controllers
{
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class HobbyLanguageController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public HobbyLanguageController(AppDbContext context, ITenantContext tenant)
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

        [HttpGet("resume/{candidateId}")]
        public async Task<IActionResult> DownloadResume(string candidateId)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return NotFound(new { message = "Candidate not found." });

            var resume = await _context.CandidateResumes
                .Where(r => r.CandidateId == targetGuid.Value) 
                .OrderByDescending(r => r.EntryDate)
                .FirstOrDefaultAsync();

            if (resume == null || resume.FileContent == null || resume.FileContent.Length == 0)
                return NotFound(new { message = "Resume file not found for this candidate." });

            string contentType = "application/octet-stream";
            string fileName = resume.FileName ?? $"Resume_{candidateId}.pdf";

            if (fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) contentType = "application/pdf";
            else if (fileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase)) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            else if (fileName.EndsWith(".doc", StringComparison.OrdinalIgnoreCase)) contentType = "application/msword";

            return File(resume.FileContent, contentType, fileName);
        }

        [HttpGet("{candidateId}")]
        public async Task<IActionResult> Get(string candidateId)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return NotFound(new { message = "Candidate not found." });

            var hobbies = await _context.CandidateHobbies
                .Where(x => x.CandidateId == targetGuid.Value)
                .ToListAsync();

            var languages = await _context.CandidateLanguages
                .Where(x => x.CandidateId == targetGuid.Value)
                .ToListAsync();

            var resume = await _context.CandidateResumes
                .Where(x => x.CandidateId == targetGuid.Value)
                .OrderByDescending(x => x.EntryDate) 
                .Select(r => new { r.FileName, r.EntryDate }) 
                .FirstOrDefaultAsync();

            return Ok(new { hobbies, languages, resume });
        }

        [HttpPost("save-details")]
        public async Task<IActionResult> SaveDetails(
            [FromQuery] string candidateId, // ✅ FIX: Accept from Query String
            [FromForm] string hobbiesJson,
            [FromForm] string languagesJson)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return BadRequest(new { message = "Candidate profile not found." });

            var hobbies = JsonSerializer.Deserialize<List<CandidateHobby>>(hobbiesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<CandidateHobby>();
            var languages = JsonSerializer.Deserialize<List<CandidateLanguage>>(languagesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<CandidateLanguage>();

            var duplicateHobbies = hobbies.Where(h => !string.IsNullOrEmpty(h.HobbyCode)).GroupBy(h => h.HobbyCode).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicateHobbies.Any()) return BadRequest(new { message = $"Duplicate Hobby Code: {duplicateHobbies.First()}" });

            var duplicateLanguages = languages.Where(l => !string.IsNullOrEmpty(l.LanguageCode)).GroupBy(l => l.LanguageCode).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            if (duplicateLanguages.Any()) return BadRequest(new { message = $"Duplicate Language Code: {duplicateLanguages.First()}" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingHobbies = await _context.CandidateHobbies
                    .Where(x => x.CandidateId == targetGuid.Value)
                    .ToListAsync();
                
                if (existingHobbies.Any()) _context.CandidateHobbies.RemoveRange(existingHobbies);

                var existingLanguages = await _context.CandidateLanguages
                    .Where(x => x.CandidateId == targetGuid.Value)
                    .ToListAsync();
                
                if (existingLanguages.Any()) _context.CandidateLanguages.RemoveRange(existingLanguages);

                foreach (var h in hobbies)
                {
                    h.Id = 0; 
                    h.CandidateId = targetGuid.Value; // ✅ Force GUID assignment
                    _context.CandidateHobbies.Add(h);
                }
                foreach (var l in languages)
                {
                    l.Id = 0; 
                    l.CandidateId = targetGuid.Value; // ✅ Force GUID assignment
                    _context.CandidateLanguages.Add(l);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Hobbies and Languages saved successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Failed to save details.", error = ex.Message });
            }
        }

        [HttpPost("upload-resume")]
        public async Task<IActionResult> UploadResume(
            [FromQuery] string candidateId, // ✅ FIX: Accept from Query String
            [FromForm] IFormFile? resumeFile,
            [FromForm] DateTime? resumeEntryDate)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return BadRequest(new { message = "Candidate profile not found." });

            if (resumeFile == null || resumeFile.Length == 0)
                return BadRequest(new { message = "No resume file provided." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var oldResumes = await _context.CandidateResumes
                    .Where(x => x.CandidateId == targetGuid.Value)
                    .ToListAsync();
                
                if (oldResumes.Any()) _context.CandidateResumes.RemoveRange(oldResumes);

                using var memoryStream = new MemoryStream();
                await resumeFile.CopyToAsync(memoryStream);

                var newResume = new CandidateResume
                {
                    CandidateId = targetGuid.Value, // ✅ Force GUID assignment
                    FileName = resumeFile.FileName,
                    FileContent = memoryStream.ToArray(),
                    EntryDate = resumeEntryDate ?? DateTime.UtcNow
                };
                _context.CandidateResumes.Add(newResume);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Resume uploaded successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Failed to upload resume.", error = ex.Message });
            }
        }
    }
}