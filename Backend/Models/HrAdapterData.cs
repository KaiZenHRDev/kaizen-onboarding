// fileName: Models/HrAdapterData.cs
using System;

namespace RecruitmentBackend.Models
{
    public class HrAdapterData : IAuditable
    {
        public int Id { get; set; }
        public string CandidateId { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        
        // This will store the entire React formData object as a JSON string
        public string FormDataJson { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}