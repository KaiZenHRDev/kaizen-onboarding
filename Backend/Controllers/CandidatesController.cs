// fileName: Backend/Controllers/CandidatesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Services; 
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace RecruitmentBackend.Controllers
{
    // DTO for the Grid View (Admin Dashboard)
    public class CandidateProfileDto 
    {
        public required string CandidateId { get; set; } 
        public required string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public required string LastName { get; set; }
        public required string FullName { get; set; }    
        
        public string Status { get; set; } = "Pending";
        
        // NEW: Added ExportStatus so it gets sent to the React frontend
        public string? ExportStatus { get; set; } 

        public string? PositionCode { get; set; }
        public string? PositionName { get; set; }
        public DateTime? AppliedDate { get; set; }
        public string? CompanyId { get; set; }
        
        public string? SalutationCode { get; set; }
        public string? SalutationDescription { get; set; } 
        public string? NewIcNumber { get; set; }
        public string? Passport { get; set; }
        public string? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
    }

    public class StatusUpdateDto
    {
        public required string Status { get; set; }
    }

    [ApiController]
    [Route("api/companies/{companyId}/[controller]")]
    public class CandidatesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant; 

        public CandidatesController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetAll()
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest("Company Context is missing.");

            var query = from app in _context.Applications
                        join profile in _context.Candidates on app.CandidateId equals profile.Id 
                        where app.CompanyId == companyId
                        select new CandidateProfileDto
                        {
                            Status = app.Status,
                            
                            // NEW: Map the ExportStatus from the database to the DTO
                            ExportStatus = app.ExportStatus, 
                            
                            PositionCode = app.PositionCode,
                            PositionName = app.Position != null ? app.Position.Name : null,
                            AppliedDate = app.AppliedAt,
                            CompanyId = app.CompanyId,
                            CandidateId = profile.CandidateId, 
                            FirstName = profile.FirstName,
                            MiddleName = profile.MiddleName,
                            LastName = profile.LastName,
                            FullName = profile.FullName,
                            Gender = profile.Gender,
                            NewIcNumber = profile.NewIcNumber,
                            Passport = profile.Passport,
                            SalutationCode = profile.SalutationCode,
                            SalutationDescription = profile.Salutation != null ? profile.Salutation.Name : null,
                            BirthDate = profile.BirthDate
                        };

            var results = await query.ToListAsync();
            return Ok(results);
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.Id == userId);

            if (candidate == null) return NotFound(new { message = "Global profile not found." });

            return Ok(candidate);
        }

        [HttpGet("{id}")]
        [Authorize] 
        public async Task<IActionResult> GetById(string id)
        {
            var profile = await _context.Candidates
                .Include(c => c.ContactInfo)
                .Include(c => c.Qualifications)
                .Include(c => c.EmploymentHistory)
                .Include(c => c.Skills)
                .Include(c => c.Hobbies)
                .Include(c => c.Languages)
                .Include(c => c.FieldExperiences) 
                .FirstOrDefaultAsync(c => c.CandidateId == id);

            if (profile == null) return NotFound(new { message = "Candidate profile not found." });

            var userRoles = User.FindAll(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).ToList();
            Console.WriteLine($"[GetById] User ID: {_tenant.UserId} | Roles: {string.Join(", ", userRoles)}");

            bool isAdmin = userRoles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase) || 
                                              r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase));
    
            if (!isAdmin && profile.Id != _tenant.UserId)
            {
                return Forbid();
            }

            var resume = await _context.CandidateResumes
                .Where(r => r.CandidateId == profile.Id)
                .Select(r => new { r.FileName })
                .FirstOrDefaultAsync();

            // Note: Since this endpoint returns the full profile for viewing, the ExportStatus isn't heavily needed here, 
            // as it's primarily used in the Grid (GetAll endpoint). However, if you need it in the modal, it is passed via the row data anyway.
            return Ok(new 
            {
                Profile = profile,
                ResumePath = resume?.FileName 
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCandidate([FromBody] Candidate candidate)
        {
            if (candidate == null) return BadRequest("Invalid data");

            var userId = _tenant.UserId;
            if (userId == Guid.Empty) return Unauthorized("User session invalid.");

            var existing = await _context.Candidates.AnyAsync(c => c.Id == userId);
            if (existing) return BadRequest("Profile already exists. Use PUT to update.");

            candidate.Id = userId;
            candidate.CreatedAt = DateTime.UtcNow;
            candidate.UpdatedAt = DateTime.UtcNow;

            _context.Candidates.Add(candidate);
            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { companyId = _tenant.CompanyId, id = candidate.CandidateId }, candidate);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving profile", error = ex.InnerException?.Message ?? ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize] 
        public async Task<IActionResult> UpdateCandidate(string id, [FromBody] Candidate candidate)
        {
            if (id != candidate.CandidateId) return BadRequest("ID Mismatch");

            var existing = await _context.Candidates.FirstOrDefaultAsync(c => c.CandidateId == id);
            if (existing == null) return NotFound();

            var userRoles = User.FindAll(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).ToList();
            bool isAdmin = userRoles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase) || 
                                              r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase));

            if (!isAdmin && existing.Id != _tenant.UserId)
                return Forbid();

            // Update details
            existing.FirstName = candidate.FirstName;
            existing.MiddleName = candidate.MiddleName;
            existing.LastName = candidate.LastName;
            existing.FullName = candidate.FullName;
            
            existing.NewIcNumber = candidate.NewIcNumber;
            existing.OldIcNumber = candidate.OldIcNumber;
            existing.SalutationCode = candidate.SalutationCode;
            existing.Passport = candidate.Passport;
            existing.BirthDate = candidate.BirthDate;
            existing.Gender = candidate.Gender;
            existing.MaritalStatusCode = candidate.MaritalStatusCode;
            existing.RaceCode = candidate.RaceCode;
            existing.NativeStatus = candidate.NativeStatus;
            existing.ReligionCode = candidate.ReligionCode;
            existing.NationalityCode = candidate.NationalityCode;
            existing.CountryOfOriginCode = candidate.CountryOfOriginCode;
            existing.RecommendationType = candidate.RecommendationType;
            existing.RecommendationDetails = candidate.RecommendationDetails;
            existing.Disability = candidate.Disability;
            existing.Referee1 = candidate.Referee1;
            existing.Referee2 = candidate.Referee2;
            existing.EntryDate = candidate.EntryDate;

            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Global profile updated successfully" });
        }

        [HttpPatch("{candidateId}/status")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> UpdateStatus(string candidateId, [FromBody] StatusUpdateDto statusDto, [FromQuery] string? positionCode)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest("Company Context is missing.");

            if (string.IsNullOrEmpty(positionCode)) 
                return BadRequest(new { message = "Position Code is required." });

            var profile = await _context.Candidates
                .Where(c => c.CandidateId == candidateId)
                .Select(c => new { c.Id })
                .FirstOrDefaultAsync();

            if (profile == null) return NotFound("Candidate not found.");

            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.CandidateId == profile.Id && a.PositionCode == positionCode && a.CompanyId == companyId);

            if (application == null) return NotFound("Application not found.");

            application.Status = statusDto.Status;
            application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Status updated to '{statusDto.Status}'" });
        }

        [HttpDelete("{candidateId}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> Delete(string candidateId, [FromQuery] string? positionCode)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId)) return BadRequest("Company Context is missing.");

            if (string.IsNullOrEmpty(positionCode))
                 return BadRequest(new { message = "PositionCode is required." });

            var profile = await _context.Candidates
                .Where(c => c.CandidateId == candidateId)
                .Select(c => new { c.Id })
                .FirstOrDefaultAsync();

            if (profile == null) return NotFound("Candidate not found.");

            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.CandidateId == profile.Id && a.PositionCode == positionCode && a.CompanyId == companyId);

            if (application == null) return NotFound("Application not found.");

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Application deleted." });
        }
    }
}