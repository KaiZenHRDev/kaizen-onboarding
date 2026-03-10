// fileName: Models/CessationReason.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentBackend.Models
{
    [Table("cessation_reasons")] 
    public class CessationReason
    {
        [Key]
        [Column("rsgnrsncode")] // From CessationCodeMap.cs
        public required string Code { get; set; }

        [Column("rsgnrsndesc")] // From CessationCodeMap.cs
        public required string Name { get; set; } 

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- ✅ NEW: Company Reference ---
        [Column("company_id")]
        public string? CompanyId { get; set; }

        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }
        // -------------------------------------
    }
}