using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    public class Qualification
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


        // --- School Information ---
        [Required]
        public required string SchoolName { get; set; }
        
        public string? SchoolTelNo { get; set; }
        public string? SchoolAddress { get; set; }

        [Required]
        public required DateTime JoinSchoolDate { get; set; } // Start Date
        
        [Required]
        public required DateTime SinceWhenDate { get; set; } // Graduation/Leaving Date

        [Required]
        public required DateTime EntryDate { get; set; } // The date the entry was created/submitted


        // --- Qualification Details ---
        [Required]
        public required string QualificationCode { get; set; } // Main code (e.g., DEGREE)
        
        public string? QualificationName { get; set; } 
        
        public string? QualificationSubCode { get; set; } 
        public string? QualificationSubName { get; set; } 
        
        public bool IsHighest { get; set; }


        // --- Grade Information ---
        public string? QualificationGradeCode { get; set; }
        public string? QualificationGradeName { get; set; } 
        public string? QualificationGradeRank { get; set; } 
        
        // Use string to allow for non-numeric CGPA entries, though form uses number input
        public string? CGPA { get; set; } 
        
        public string? OtherGradeInfo { get; set; }


        // System fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}