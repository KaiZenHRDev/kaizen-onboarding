// fileName: Backend/Models/Company.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentBackend.Models 
{
    [Index(nameof(CompanyId), IsUnique = true)] 
    public class Company
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; } 

        [Required]
        [Column("company_id")]
        [StringLength(50)]
        public string CompanyId { get; set; } = string.Empty;

        [Required]
        [Column("company_name")]
        [StringLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [Column("company_details")]
        public string? CompanyDetails { get; set; }

        [Column("colour_code")]
        [StringLength(20)]
        public string? ColourCode { get; set; }

        [Column("logo_path")]
        public string? LogoPath { get; set; } 

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}