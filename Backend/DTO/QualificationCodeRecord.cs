// fileName: QualificationCodeRecord.cs
using CsvHelper.Configuration.Attributes;
using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models 
{
    public class QualificationCodeRecord
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string SubCode { get; set; } = null!;
        public string SubName { get; set; } = null!;
    }
}