// fileName: Backend/Models/ThanksPage.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Added for ForeignKey

namespace RecruitmentBackend.Models
{
    public class ThanksPage
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string CompanyId { get; set; } = string.Empty;

        // Field 1
        public string ThanksTitle { get; set; } = "Application Successful!";

        // Field 2
        public string ThanksMessage { get; set; } = "Your application has been received and is now under review by our recruitment team. We will contact you shortly if your profile matches our requirements.";

        // Field 3 (Title is now hardcoded in UI, only message is dynamic)
        public string NextStepsMessage { get; set; } = "Our team will review your submission and contact you directly via the email or phone number provided.";

        // Field 4
        public string ThanksFooter { get; set; } = "Thank you for choosing to grow with us.";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // --- ✅ FIX: Add this Navigation Property ---
        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }
    }
}