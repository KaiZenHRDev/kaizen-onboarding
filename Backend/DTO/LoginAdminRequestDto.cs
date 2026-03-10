using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models.Dtos
{
    public class LoginAdminRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}