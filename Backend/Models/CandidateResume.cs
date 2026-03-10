using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    public class CandidateResume : IAuditable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // FIX: Changed to 'string?' (nullable).
        [Required]
        public Guid CandidateId { get; set; }

        // ✅ 2. Navigation Property
        [ForeignKey("CandidateId")]
        [JsonIgnore] // Prevent cyclic JSON loops
        public Candidate? Candidate { get; set; }


        public string? FileName { get; set; }

        public byte[]? FileContent { get; set; } 
        
        public DateTime EntryDate { get; set; }

        // IAuditable implementation
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}