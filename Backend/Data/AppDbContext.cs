// fileName: Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RecruitmentBackend.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public interface IAuditable
{
    DateTime CreatedAt { get; set; }
    DateTime? UpdatedAt { get; set; }
}

namespace RecruitmentBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // --- Core Application Entities ---
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ContactInformation> ContactInformation { get; set; }
        public DbSet<Qualification> Qualifications { get; set; }
        public DbSet<EmploymentHistory> EmploymentHistories { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<ThanksPage> ThanksPages { get; set; }

        // Candidate Specific Data
        public DbSet<CandidateHobby> CandidateHobbies { get; set; }
        public DbSet<CandidateLanguage> CandidateLanguages { get; set; }
        public DbSet<CandidateResume> CandidateResumes { get; set; }
        public DbSet<FieldExperience> FieldExperiences { get; set; }

        // Normalized Lookup Tables
        public DbSet<Salutation> Salutations { get; set; }
        public DbSet<MaritalStatus> MaritalStatuses { get; set; }
        public DbSet<Race> Races { get; set; }
        public DbSet<Religion> Religions { get; set; }
        public DbSet<Nationality> Nationalities { get; set; }
        public DbSet<CountryOrigin> CountryOrigins { get; set; }

        public DbSet<QualificationCode> QualificationCodes { get; set; }
        public DbSet<QualificationGrade> QualificationGrades { get; set; }

        public DbSet<Industry> Industries { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<CessationReason> CessationReasons { get; set; }
        public DbSet<Hobby> Hobbies { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<FieldArea> FieldAreas { get; set; }

        // --- NEW HR ADAPTER / BPO LOOKUP TABLES ---
        public DbSet<BranchCode> BranchCodes { get; set; }
        public DbSet<CompanyCode> CompanyCodes { get; set; }
        public DbSet<DepartmentCode> DepartmentCodes { get; set; }
        public DbSet<DivisionCode> DivisionCodes { get; set; }
        public DbSet<EmptyCode> EmptyCodes { get; set; }
        public DbSet<EpfCode> EpfCodes { get; set; }
        public DbSet<GL1Code> GL1Codes { get; set; }
        public DbSet<GL2Code> GL2Codes { get; set; }
        public DbSet<JobGradeCode> JobGradeCodes { get; set; }
        public DbSet<PayGroupCode> PayGroupCodes { get; set; }
        public DbSet<PCBCode> PCBCodes { get; set; }
        public DbSet<PensionCode> PensionCodes { get; set; }
        public DbSet<SectionCode> SectionCodes { get; set; }
        public DbSet<SecurityCode> SecurityCodes { get; set; }
        public DbSet<SocsoCode> SocsoCodes { get; set; }
        public DbSet<StatutoryCode> StatutoryCodes { get; set; }
        public DbSet<UnitCode> UnitCodes { get; set; }
        public DbSet<VECode> VECodes { get; set; }
        
        // --- HR ADAPTER SAVED DATA ---
        public DbSet<HrAdapterData> HrAdapterData { get; set; }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<DateTime>().HaveConversion<DateTimeToUtcConverter>();
            configurationBuilder.Properties<DateTime?>().HaveConversion<NullableDateTimeToUtcConverter>();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============================================================
            // 1. COMPANY
            // ============================================================
            modelBuilder.Entity<Company>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.HasAlternateKey(c => c.CompanyId);
                entity.HasIndex(c => c.CompanyId).IsUnique();
            });

            // ============================================================
            // 2. USER
            // ============================================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => new { u.IcNumber, u.CompanyId }).IsUnique();
                entity.HasIndex(u => new { u.Email, u.CompanyId }).IsUnique();
            });

            // ============================================================
            // 3. LOOKUPS 
            // ============================================================
            void ConfigureLookup<T>() where T : class
            {
                modelBuilder.Entity<T>(entity =>
                {
                    entity.HasOne("Company")
                        .WithMany()
                        .HasForeignKey("CompanyId")
                        .HasPrincipalKey("CompanyId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
            }

            ConfigureLookup<Salutation>();
            ConfigureLookup<MaritalStatus>();
            ConfigureLookup<Race>();
            ConfigureLookup<Religion>();
            ConfigureLookup<Nationality>();
            ConfigureLookup<CountryOrigin>();
            ConfigureLookup<QualificationCode>();
            ConfigureLookup<QualificationGrade>();
            ConfigureLookup<Industry>();
            ConfigureLookup<Job>();
            ConfigureLookup<Position>();
            ConfigureLookup<CessationReason>();
            ConfigureLookup<Hobby>();
            ConfigureLookup<Language>();
            ConfigureLookup<FieldArea>();
            ConfigureLookup<ThanksPage>();

            // --- Configure newly added lookups ---
            ConfigureLookup<BranchCode>();
            ConfigureLookup<CompanyCode>();
            ConfigureLookup<DepartmentCode>();
            ConfigureLookup<DivisionCode>();
            ConfigureLookup<EmptyCode>();
            ConfigureLookup<EpfCode>();
            ConfigureLookup<GL1Code>();
            ConfigureLookup<GL2Code>();
            ConfigureLookup<JobGradeCode>();
            ConfigureLookup<PayGroupCode>();
            ConfigureLookup<PCBCode>();
            ConfigureLookup<PensionCode>();
            ConfigureLookup<SectionCode>();
            ConfigureLookup<SecurityCode>();
            ConfigureLookup<SocsoCode>();
            ConfigureLookup<StatutoryCode>();
            ConfigureLookup<UnitCode>();
            ConfigureLookup<VECode>();

            // ============================================================
            // 4. CANDIDATE (GLOBAL PROFILE)
            // ============================================================
            modelBuilder.Entity<Candidate>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.HasIndex(c => c.CandidateId).IsUnique(); // Business ID unique

                entity.Property(e => e.BirthDate).HasColumnType("date");
                entity.Property(e => e.EntryDate).HasColumnType("date");

                // 1:1 Skill
                entity.HasOne(c => c.Skills)
                    .WithOne(s => s.Candidate)
                    .HasForeignKey<Skill>(s => s.CandidateId)
                    .OnDelete(DeleteBehavior.Cascade);

                // 1:1 Contact
                entity.HasOne(c => c.ContactInfo)
                    .WithOne(ci => ci.Candidate)
                    .HasForeignKey<ContactInformation>(ci => ci.CandidateId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================================================
            // 5. APPLICATION
            // ============================================================
            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasKey(a => a.Id);

                entity.HasIndex(a => new { a.CandidateId, a.PositionCode, a.CompanyId })
                    .IsUnique();

                entity.Property(a => a.ProfileSnapshot).HasColumnType("jsonb");

                entity.HasOne(a => a.Candidate)
                    .WithMany()
                    .HasForeignKey(a => a.CandidateId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Position)
                    .WithMany()
                    .HasForeignKey(a => new { a.PositionCode, a.CompanyId });
            });

            // ============================================================
            // 6. CANDIDATE CHILD COLLECTIONS 
            // ============================================================

            modelBuilder.Entity<Qualification>()
                .HasOne(q => q.Candidate)
                .WithMany(c => c.Qualifications)
                .HasForeignKey(q => q.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmploymentHistory>()
                .HasOne(e => e.Candidate)
                .WithMany(c => c.EmploymentHistory)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateHobby>()
                .HasOne(h => h.Candidate)
                .WithMany(c => c.Hobbies)
                .HasForeignKey(h => h.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateLanguage>()
                .HasOne(l => l.Candidate)
                .WithMany(c => c.Languages)
                .HasForeignKey(l => l.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FieldExperience>()
                .HasOne(f => f.Candidate)
                .WithMany(c => c.FieldExperiences)
                .HasForeignKey(f => f.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CandidateResume>()
                .HasOne(r => r.Candidate)
                .WithMany(c => c.Resumes)
                .HasForeignKey(r => r.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================================================
            // 7. CANDIDATE -> LOOKUPS
            // ============================================================

            modelBuilder.Entity<Candidate>().HasOne(e => e.Salutation).WithMany()
                .HasForeignKey(e => e.SalutationCode).HasPrincipalKey(s => s.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);

            modelBuilder.Entity<Candidate>().HasOne(e => e.MaritalStatus).WithMany()
                .HasForeignKey(e => e.MaritalStatusCode).HasPrincipalKey(s => s.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);

            modelBuilder.Entity<Candidate>().HasOne(e => e.Race).WithMany()
                .HasForeignKey(e => e.RaceCode).HasPrincipalKey(r => r.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);

            modelBuilder.Entity<Candidate>().HasOne(e => e.Religion).WithMany()
                .HasForeignKey(e => e.ReligionCode).HasPrincipalKey(r => r.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);

            modelBuilder.Entity<Candidate>().HasOne(e => e.Nationality).WithMany()
                .HasForeignKey(e => e.NationalityCode).HasPrincipalKey(n => n.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);

            modelBuilder.Entity<Candidate>().HasOne(e => e.CountryOfOrigin).WithMany()
                .HasForeignKey(e => e.CountryOfOriginCode).HasPrincipalKey(c => c.Code)
                .OnDelete(DeleteBehavior.Restrict).IsRequired(false);
                
            // ============================================================
            // 8. HR ADAPTER DATA
            // ============================================================
            modelBuilder.Entity<HrAdapterData>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.CandidateId, e.CompanyId }).IsUnique(); // One record per candidate per company
            });
        }

        public override int SaveChanges() { ApplyTimestamps(); return base.SaveChanges(); }
        public override async Task<int> SaveChangesAsync(CancellationToken token = default) { ApplyTimestamps(); return await base.SaveChangesAsync(token); }

        private void ApplyTimestamps()
        {
            var entries = ChangeTracker.Entries().Where(e => e.Entity is IAuditable && (e.State == EntityState.Added || e.State == EntityState.Modified));
            foreach (var entityEntry in entries)
            {
                var aud = (IAuditable)entityEntry.Entity;
                if (entityEntry.State == EntityState.Added) aud.CreatedAt = DateTime.UtcNow;
                aud.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    public class DateTimeToUtcConverter : ValueConverter<DateTime, DateTime>
    { public DateTimeToUtcConverter() : base(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc)) { } }

    public class NullableDateTimeToUtcConverter : ValueConverter<DateTime?, DateTime?>
    { public NullableDateTimeToUtcConverter() : base(v => v.HasValue ? v.Value.ToUniversalTime() : v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v) { } }
}