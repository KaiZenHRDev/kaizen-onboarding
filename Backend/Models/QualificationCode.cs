// fileName: Backend/Models/QualificationCode.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore; // ✅ Added for [PrimaryKey]

namespace RecruitmentBackend.Models
{
    [Table("qualification_codes")]
    // ✅ FIX: Explicitly define the composite key here
    [PrimaryKey(nameof(Code), nameof(SubCode), nameof(CompanyId))]
    public class QualificationCode
    {
        [Column("qlfcatid")] 
        public required string Code { get; set; }

        [Column("qlfcatname")] 
        public required string Name { get; set; }
        
        [Column("qlfsubid")] 
        public required string SubCode { get; set; }
        
        [Column("qlfsubname")] 
        public required string SubName { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ FIX: Changed from 'string?' to 'required string'
        // Primary Key parts CANNOT be null.
        [Column("company_id")]
        public required string CompanyId { get; set; }

        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }
    }
}