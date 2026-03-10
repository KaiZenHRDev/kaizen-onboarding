// fileName: Models/FieldExperience.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RecruitmentBackend.Data;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    public class FieldExperience : IAuditable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // System IDs (Must exist for linking, but handled by code, not user)
        [Required]
        public Guid CandidateId { get; set; }

        // ✅ 2. Navigation Property
        [ForeignKey("CandidateId")]
        [JsonIgnore] // Prevent cyclic JSON loops
        public Candidate? Candidate { get; set; }

        
        public string? FieldName { get; set; } 

        public string? FieldAreaCode { get; set; } 

        public int YearsOfExperience { get; set; } = 0; // Default to 0 if not provided
        
        public string? Description { get; set; }
             
        public DateTime EntryDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}