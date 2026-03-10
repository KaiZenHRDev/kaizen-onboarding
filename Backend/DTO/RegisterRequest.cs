// fileName: Models/Dtos/RegisterRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models.Dtos
{
    public class RegisterRequestDto
    {
        [Required]
        public string IcNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        // ✅ ADDED: Required for multi-company support
        
        public string CompanyId { get; set; } = string.Empty;
    }
}