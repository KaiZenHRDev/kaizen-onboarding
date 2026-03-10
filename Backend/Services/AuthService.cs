// fileName: Backend/Services/AuthService.cs
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Models.Dtos; 
using BCrypt.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace RecruitmentBackend.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateCandidateIdAsync()
        {
            // ✅ FIX: Query the Users table instead of Candidates.
            // During registration, the CandidateId is assigned to the User, but the Candidate profile
            // isn't created until their first login. Querying Candidates causes duplicate IDs for users 
            // who register back-to-back before logging in.
            var lastUser = await _context.Users
                .Where(u => u.CandidateId != null && u.CandidateId.StartsWith("CAND"))
                .OrderByDescending(u => u.CandidateId)
                .FirstOrDefaultAsync();

            if (lastUser == null || string.IsNullOrEmpty(lastUser.CandidateId)) 
                return "CAND0001";

            string numericPart = lastUser.CandidateId.Replace("CAND", "");
            if (int.TryParse(numericPart, out int number))
            {
                return $"CAND{(number + 1):D4}";
            }
            return "CAND0001";
        }

        public async Task<Candidate> EnsureCandidateProfileAsync(User user)
        {
            var profile = await _context.Candidates.FindAsync(user.Id);

            if (profile == null)
            {
                // ✅ FIX: Double-check to prevent race conditions (duplicate creation on rapid double-clicks)
                bool exists = await _context.Candidates.AnyAsync(c => c.Id == user.Id);
                if (exists) return (await _context.Candidates.FindAsync(user.Id))!;

                // Declare as nullable 'string?' to handle potential null from user.CandidateId
                string? businessId = user.CandidateId;

                // If null or empty, generate a new one
                if (string.IsNullOrEmpty(businessId))
                {
                    businessId = await GenerateCandidateIdAsync();
                    
                    // Sync back to User record to keep them consistent
                    user.CandidateId = businessId;
                    _context.Users.Update(user);
                }

                profile = new Candidate
                {
                    // MATCHING: Candidate Id is set to the User Id (Global GUID)
                    Id = user.Id, 
                    // Use '!' (null-forgiving) operator because we know businessId is not null here
                    CandidateId = businessId!, 
                    
                    // NEW FIELDS: Added to satisfy the "required" constraints on the model
                    FirstName = "",
                    LastName = "",
                    FullName = "", // Placeholder, to be filled by user
                    
                    NewIcNumber = user.IcNumber ?? string.Empty
                };
                
                _context.Candidates.Add(profile);
                await _context.SaveChangesAsync();
            }
            return profile;
        }

        public async Task<List<object>> GetAdminListAsync(string companyId)
        {
            var query = from user in _context.Users
                        join company in _context.Companies on user.CompanyId equals company.CompanyId into gj
                        from subCompany in gj.DefaultIfEmpty()
                        where user.Role == "Admin"
                        select new {
                            user.Id,
                            user.Email,
                            user.CompanyId,
                            CompanyName = subCompany != null ? subCompany.CompanyName : "Not Assigned",
                            user.IsActive,
                            user.IsFirstLogin,
                            user.CreatedAt
                        };

            if (companyId != "SYSTEM")
            {
                query = query.Where(u => u.CompanyId == companyId);
            }

            return await query.OrderByDescending(u => u.CreatedAt).Cast<object>().ToListAsync();
        }

        public async Task<bool> CreateAdminAsync(string companyId, CreateAdminRequestDto request)
        {
            // Validate Company Exists
            if (!await _context.Companies.AnyAsync(c => c.CompanyId == companyId))
                throw new InvalidOperationException($"Company ID '{companyId}' is not registered.");

            // Validate Email Uniqueness
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
                throw new InvalidOperationException($"The email '{request.Email}' is already in use.");

            var newAdmin = new User
            {
                Email = request.Email.Trim(),
                CompanyId = companyId,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Admin",
                IsActive = true,
                IsFirstLogin = true
            };

            _context.Users.Add(newAdmin);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAdminAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;
            
            _context.Users.Remove(user);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ToggleAdminStatusAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;
            
            user.IsActive = !user.IsActive;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}