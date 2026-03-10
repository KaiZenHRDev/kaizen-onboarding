// fileName: Models/Dtos/ForgotPasswordCandidateDto.cs
using System.ComponentModel.DataAnnotations;

namespace RecruitmentBackend.Models.Dtos
{
    public class ForgotPasswordCandidateDto
    {
        [Required(ErrorMessage = "IC Number is required.")]
        public string IcNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "New Password is required.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please confirm your new password.")]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}