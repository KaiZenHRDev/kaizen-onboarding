// fileName: Models/Position.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentBackend.Models
{
    [Table("position_codes")]
    [PrimaryKey(nameof(Code), nameof(CompanyId))]
    public class Position
    {
        [Column("jobcode")] 
        public required string Code { get; set; } 

        [Column("jobpost")] 
        public required string Name { get; set; } 

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("company_id")]
        public required string CompanyId { get; set; }

        // ✅ Added for Position filtering
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }
    }
}