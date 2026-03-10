// fileName: Backend/Models/Application.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    public class Application : IAuditable
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CandidateId { get; set; }

        // ✅ 2. Navigation Property
        [ForeignKey("CandidateId")]
        [JsonIgnore] // Prevent cyclic JSON loops
        public Candidate? Candidate { get; set; }
        
        [Required]
        public required string CompanyId { get; set; } // ✅ FIXED

        // The specific Job
        [Required]
        public required string PositionCode { get; set; } // ✅ FIXED
        
        [ForeignKey("PositionCode, CompanyId")]
        public Position? Position { get; set; }

        public string Status { get; set; } = "Pending"; 

        public required string ExportStatus { get; set; }

        // SNAPSHOT
        [Column(TypeName = "jsonb")] 
        public required string ProfileSnapshot { get; set; } // ✅ FIXED

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}