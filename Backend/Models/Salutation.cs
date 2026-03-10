// fileName: Models/Salutation.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentBackend.Models
{
    [Table("salutation_code")] 
    public class Salutation
    {
        [Key]
        [Column("salucode")] 
        public required string Code { get; set; }

        [Column("saludesc")] 
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