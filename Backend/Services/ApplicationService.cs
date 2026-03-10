// fileName: Backend/Services/ApplicationService.cs
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace RecruitmentBackend.Services
{
    public class ApplicationService
    {
        private readonly AppDbContext _context;

        public ApplicationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Application> ApplyAsync(Guid candidateGuid, string positionCode, string companyId)
        {
            if (string.IsNullOrEmpty(companyId)) throw new ArgumentNullException(nameof(companyId));

            var existing = await _context.Applications
                .FirstOrDefaultAsync(a => a.CandidateId == candidateGuid && a.PositionCode == positionCode && a.CompanyId == companyId);
            
            if (existing != null) return existing; 

            var profile = await _context.Candidates 
                .Include(p => p.ContactInfo)
                .Include(p => p.Skills)
                .Include(p => p.Qualifications)
                .Include(p => p.EmploymentHistory)
                .Include(p => p.Hobbies)           
                .Include(p => p.Languages)         
                .Include(p => p.FieldExperiences)
                .Include(p => p.Resumes) 
                .FirstOrDefaultAsync(p => p.Id == candidateGuid);

            if (profile == null) throw new Exception("Profile not found. Please complete your details first.");

            var options = new JsonSerializerOptions { ReferenceHandler = ReferenceHandler.IgnoreCycles };
            string snapshot = JsonSerializer.Serialize(profile, options);

            var app = new Application
            {
                CandidateId = candidateGuid, 
                CompanyId = companyId,
                PositionCode = positionCode,
                ProfileSnapshot = snapshot,
                Status = "Pending",
                ExportStatus = "Pending", // Initialize tracking
                AppliedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Applications.Add(app);
            await _context.SaveChangesAsync();

            return app;
        }

        // FIXED: Now safely accepts the string ID and maps it properly
        public async Task<bool> UpdateExportStatusAsync(string candidateIdString, string companyId, string positionCode, string newExportStatus)
        {
            // 1. Look up the Candidate's internal Guid using the string ID
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.CandidateId == candidateIdString);
            
            if (candidate == null) return false;

            // 2. Handle cases where positionCode might be "NULL" from frontend
            var actualPositionCode = positionCode == "NULL" ? null : positionCode;

            // 3. Find the exact application match
            var appQuery = _context.Applications
                .Where(a => a.CandidateId == candidate.Id && a.CompanyId == companyId);

            if (actualPositionCode != null)
            {
                appQuery = appQuery.Where(a => a.PositionCode == actualPositionCode);
            }

            var application = await appQuery.FirstOrDefaultAsync();

            if (application == null) return false;

            // 4. Update the status
            application.ExportStatus = newExportStatus;
            application.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}