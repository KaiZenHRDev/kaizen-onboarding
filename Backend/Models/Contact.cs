// fileName: Backend/Models/Contact.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    [Table("ContactInformation")]
    public class ContactInformation : IAuditable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        // ✅ TRUE FOREIGN KEY (GUID)
        [Required]
        public Guid CandidateId { get; set; }

        // ✅ 2. Navigation Property
        [ForeignKey("CandidateId")]
        [JsonIgnore] // Prevent cyclic JSON loops
        public Candidate? Candidate { get; set; }

        // --- DATA ---
        [Required(ErrorMessage = "Email Address is required.")]
        [EmailAddress(ErrorMessage = "Invalid Email Address format.")]
        [Column("email")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Phone Number is required.")]
        [Column("phone_number")]
        public required string PhoneNumber { get; set; }

        [Column("office_number")]
        public string? OfficeNumber { get; set; }

        [Column("other_number")]
        public string? OtherNumber { get; set; }

        [Required(ErrorMessage = "Current Address is required.")]
        [Column("correspondence_address")]
        public required string CorrespondenceAddress { get; set; }

        [Column("correspondence_phone")]
        public string? CorrespondencePhone { get; set; }

        [Column("permanent_address")]
        public string? PermanentAddress { get; set; }

        [Column("permanent_phone")]
        public string? PermanentPhone { get; set; }

        [Column("emergency_contact_name")]
        public string? EmergencyContactName { get; set; }

        [Column("emergency_address")]
        public string? EmergencyAddress { get; set; }

        [Column("emergency_phone")]
        public string? EmergencyPhone { get; set; }

        // System Fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
