using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Models
{
    public class Candidate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid Id { get; set; }

        public required string CandidateId { get; set; } 

        // --- Name Details ---
        public required string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public required string LastName { get; set; }
        public required string FullName { get; set; }
        public required string NewIcNumber { get; set; }


        // --- Demographics ---
        public string? SalutationCode { get; set; }
        [ForeignKey("SalutationCode")]
        public Salutation? Salutation { get; set; }

        public string? OldIcNumber { get; set; }
        public string? Passport { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }

        // --- Navigation Properties ---
        public string? MaritalStatusCode { get; set; }
        [ForeignKey("MaritalStatusCode")]
        public MaritalStatus? MaritalStatus { get; set; }

        public string? RaceCode { get; set; }
        [ForeignKey("RaceCode")]
        public Race? Race { get; set; }

        public string? ReligionCode { get; set; }
        [ForeignKey("ReligionCode")]
        public Religion? Religion { get; set; }

        public string? NationalityCode { get; set; }
        [ForeignKey("NationalityCode")]
        public Nationality? Nationality { get; set; }

        public string? CountryOfOriginCode { get; set; }
        [ForeignKey("CountryOfOriginCode")]
        public CountryOrigin? CountryOfOrigin { get; set; }

        public string? NativeStatus { get; set; }

        // --- Extra Info ---
        public string? RecommendationType { get; set; }
        public string? RecommendationDetails { get; set; }
        public string? Disability { get; set; }
        
        public string? Referee1 { get; set; }
        public string? Referee2 { get; set; }

        // FIX: Changed to nullable 'DateTime?' because AppDbContext uses .HasValue
        public DateTime? EntryDate { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // --- Collections ---
        public ContactInformation? ContactInfo { get; set; }
        public ICollection<Qualification> Qualifications { get; set; } = new List<Qualification>();
        public ICollection<EmploymentHistory> EmploymentHistory { get; set; } = new List<EmploymentHistory>();
        public Skill? Skills { get; set; } 
        public ICollection<CandidateHobby> Hobbies { get; set; } = new List<CandidateHobby>();
        public ICollection<CandidateLanguage> Languages { get; set; } = new List<CandidateLanguage>();
        public ICollection<FieldExperience> FieldExperiences { get; set; } = new List<FieldExperience>();
        public ICollection<CandidateResume> Resumes { get; set; } = new List<CandidateResume>();
    }
}