// fileName: Models/Dtos/LoginRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models.Dtos
{
    public class LoginRequestDto
    {
        [Required]
        public string IcNumber { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        // ✅ ADDED: Required to identify which company the user is logging into
        [Required]
        public string CompanyId { get; set; } = string.Empty;
        public string? PositionCode { get; set; }
    }
}