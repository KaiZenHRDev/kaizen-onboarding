// fileName: CodeRecord.cs
using CsvHelper.Configuration.Attributes; // Required for Name attribute
using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models
{
    // DTO for simple 2-column CSVs
    public class CodeRecord
    {
        
        
        public required string Code { get; set; }

        
        public required string Name { get; set; }
    }
}