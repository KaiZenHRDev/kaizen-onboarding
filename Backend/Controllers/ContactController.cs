// fileName: Backend/Controllers/ContactController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RecruitmentBackend.Controllers
{
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public ContactController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        // ✅ HELPER: The "Bridge" that converts String ID -> Guid ID
        private async Task<Guid?> ResolveCandidateGuid(string candidateId)
        {
            // 1. If it's already a Guid string, return it.
            if (Guid.TryParse(candidateId, out Guid guid)) return guid;

            // 2. If it's "CAND001", find the Guid in the database.
            var candidate = await _context.Candidates
                .AsNoTracking()
                .Select(c => new { c.Id, c.CandidateId })
                .FirstOrDefaultAsync(c => c.CandidateId == candidateId);

            return candidate?.Id;
        }

        // POST: api/companies/{companyId}/Contact?candidateId=CAND001
        // ✅ NOTE: We take candidateId from Query String to avoid Model Binding errors on the Body
        [HttpPost]
        public async Task<IActionResult> SaveContact(
            [FromQuery] string candidateId, 
            [FromBody] ContactInformation contactData)
        {
            if (string.IsNullOrEmpty(_tenant.CompanyId)) return BadRequest(new { message = "Company Context is missing." });

            // 1. Resolve the Real Guid
            var targetGuid = await ResolveCandidateGuid(candidateId);

            // Fallback: If URL param is missing, check if the Body had a valid Guid
            if (targetGuid == null && contactData.CandidateId != Guid.Empty)
            {
                targetGuid = contactData.CandidateId;
            }

            if (targetGuid == null || targetGuid == Guid.Empty) 
                return BadRequest(new { message = "Valid Candidate ID is required (e.g. ?candidateId=CAND001)" });

            // 2. Clear Model State errors for CandidateId (since we handled it manually)
            ModelState.Remove(nameof(ContactInformation.CandidateId));
            
            if (contactData == null) return BadRequest(new { message = "Invalid data provided." });
            // Re-check validity excluding CandidateId
            // if (!ModelState.IsValid) return BadRequest(ModelState); 

            // 3. Validate Candidate Exists (using Guid)
            var candidateExists = await _context.Candidates.AnyAsync(e => e.Id == targetGuid);
            if (!candidateExists)
            {
                return BadRequest(new { message = "Candidate profile not found." });
            }

            try
            {
                // 4. Force the Guid onto the model
                contactData.CandidateId = targetGuid.Value;

                // 5. Check for existing record (using Guid)
                var existingContact = await _context.ContactInformation
                    .FirstOrDefaultAsync(c => c.CandidateId == targetGuid.Value);

                if (existingContact != null)
                {
                    // --- UPDATE ---
                    existingContact.Email = contactData.Email;
                    existingContact.PhoneNumber = contactData.PhoneNumber;
                    existingContact.OfficeNumber = contactData.OfficeNumber;
                    existingContact.OtherNumber = contactData.OtherNumber;
                    existingContact.CorrespondenceAddress = contactData.CorrespondenceAddress;
                    existingContact.CorrespondencePhone = contactData.CorrespondencePhone;
                    existingContact.PermanentAddress = contactData.PermanentAddress;
                    existingContact.PermanentPhone = contactData.PermanentPhone;
                    existingContact.EmergencyContactName = contactData.EmergencyContactName;
                    existingContact.EmergencyAddress = contactData.EmergencyAddress;
                    existingContact.EmergencyPhone = contactData.EmergencyPhone;
                    
                    existingContact.UpdatedAt = DateTime.UtcNow;

                    _context.ContactInformation.Update(existingContact);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Contact information updated.", id = existingContact.Id });
                }
                else
                {
                    // --- CREATE ---
                    contactData.Id = 0; 
                    contactData.CreatedAt = DateTime.UtcNow;
                    // CandidateId is already set to targetGuid above
                    
                    _context.ContactInformation.Add(contactData);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Contact information saved.", id = contactData.Id });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        // GET: api/companies/{companyId}/Contact/{candidateId}
        [HttpGet("{candidateId}")]
        public async Task<IActionResult> GetContact(string candidateId)
        {
            if (string.IsNullOrEmpty(_tenant.CompanyId)) return BadRequest(new { message = "Company Context is missing." });

            // 1. Resolve String -> Guid
            var targetGuid = await ResolveCandidateGuid(candidateId);
            
            if (targetGuid == null) 
            {
                // If we can't find the candidate, return null (empty form) rather than error
                return Ok(null); 
            }

            // 2. Fetch using Guid
            var contact = await _context.ContactInformation
                .FirstOrDefaultAsync(c => c.CandidateId == targetGuid);

            if (contact == null) return Ok(null);

            return Ok(contact);
        }
    }
}