using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models.Dtos
{
    public class CreateAdminRequestDto
    {
        [Required]
        public string CompanyId { get; set; } = string.Empty; // ✅ Explicitly separate CompanyId

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; } = string.Empty;
    }
}