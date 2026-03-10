// fileName: Models/User.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 
using Microsoft.EntityFrameworkCore; 
using RecruitmentBackend.Data; 

namespace RecruitmentBackend.Models
{
    [Index(nameof(CompanyId))] 
    public class User : IAuditable 
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string? CandidateId { get; set; } 

        public string? CompanyId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // ✅ UPDATE: Removed [Required] and made it nullable (string?)
        // This allows Admins to have 'null' IC numbers.
        public string? IcNumber { get; set; } 

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Candidate"; 

        public bool IsActive { get; set; } = true;
        
        public bool IsFirstLogin { get; set; } = true; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
}