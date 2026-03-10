using CsvHelper.Configuration.Attributes;
using System.ComponentModel.DataAnnotations;

// Ensure this namespace matches your project structure
// fileName: QualificationCodeRecord.cs

// fileName: QualificationCodeRecord.cs
namespace RecruitmentBackend.Models 
{
    public class GradeRecord
    {
        public string GradeCode { get; set; } = null!;
        public string GradeName { get; set; } = null!;
        public string GradeRank { get; set; } = null!;
    }
}