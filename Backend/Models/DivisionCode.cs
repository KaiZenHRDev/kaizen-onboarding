// fileName: Models/DivisionCode.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentBackend.Models
{
    [Table("division_code")] 
    public class DivisionCode
    {
        [Key]
        [Column("divisncode")] 
        public required string Code { get; set; }

        [Column("divisnname")] 
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