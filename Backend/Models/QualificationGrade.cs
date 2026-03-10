// fileName: Backend/Models/QualificationGrade.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore; // ✅ Added

namespace RecruitmentBackend.Models
{
    [Table("qualification_grades")]
    // ✅ FIX: Define composite key properly
    [PrimaryKey(nameof(Code), nameof(CompanyId))] 
    public class QualificationGrade
    {
        [Column("qlfgradecode")] 
        public required string Code { get; set; } // Removed [Key] to avoid conflict

        [Column("qlfgradename")] 
        public required string Description { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ FIX: Must be required for Primary Key
        [Column("company_id")]
        public required string CompanyId { get; set; }

        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }
    }
}