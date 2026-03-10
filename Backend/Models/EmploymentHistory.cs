using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RecruitmentBackend.Data; 
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    // Implements IAuditable to work with AppDbContext.ApplyTimestamps
    public class EmploymentHistory : IAuditable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Foreign Key to Employee/Candidate
       [Required]
        public Guid CandidateId { get; set; }

        // ✅ 2. Navigation Property
        [ForeignKey("CandidateId")]
        [JsonIgnore] // Prevent cyclic JSON loops
        public Candidate? Candidate { get; set; }


        // --- Employer/Contact Info ---
        
        public required string EmployerName { get; set; }
        
        public string? TelNo { get; set; }
        public string? Address { get; set; }


        // --- Dates and Status ---
        
        public required DateTime FromDate { get; set; }
        
        public DateTime? ToDate { get; set; }
        
        public bool Latest { get; set; }


        // --- Job/Position Details ---
        public string? IndustryCode { get; set; }
        
        
        public required string JobCode { get; set; }
        
        public string? JobName { get; set; } 
        
        public string? EmphJobName { get; set; } 
        
        public string? JobFunction { get; set; } 


        // --- Salary ---
        [Column(TypeName = "numeric")] 
        public decimal? StartSalary { get; set; } 

        [Column(TypeName = "numeric")] 
        public decimal? LastSalary { get; set; } 


        // --- Cessation ---
        public string? CessationReasonCode { get; set; } 
        
        public string? CessationReasonDescription { get; set; }


        // --- System Fields ---
        public DateTime EntryDate { get; set; } 
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}