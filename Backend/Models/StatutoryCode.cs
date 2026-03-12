// fileName: Models/StatutoryCode.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentBackend.Models
{
    [Table("statutory_code")] 
    public class StatutoryCode
    {
        [Key]
        [Column("corefcode")] 
        public required string Code { get; set; }

        [Column("compnycode")] 
        public required string CompanyCode { get; set; } 

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