// fileName: Backend/Controllers/SkillController.cs
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
    public class SkillController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant;

        public SkillController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        private async Task<Guid?> ResolveCandidateGuid(string candidateId)
        {
            if (Guid.TryParse(candidateId, out Guid guid)) return guid;

            var candidate = await _context.Candidates
                .AsNoTracking()
                .Select(c => new { c.Id, c.CandidateId })
                .FirstOrDefaultAsync(c => c.CandidateId == candidateId);

            return candidate?.Id;
        }

        [HttpGet("{candidateId}")]
        public async Task<ActionResult<Skill>> GetSkill(string candidateId)
        {
            if (string.IsNullOrEmpty(_tenant.CompanyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);
            if (targetGuid == null) return NotFound(new { message = "Candidate not found." });

            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.CandidateId == targetGuid.Value);

            return Ok(skill); 
        }

        [HttpPost]
        public async Task<IActionResult> SaveSkill(
            [FromQuery] string candidateId, 
            [FromBody] Skill skillData)
        {
            if (string.IsNullOrEmpty(_tenant.CompanyId)) return BadRequest(new { message = "Company Context is missing." });

            var targetGuid = await ResolveCandidateGuid(candidateId);

            if (targetGuid == null || targetGuid == Guid.Empty)
                return BadRequest(new { message = "Valid Candidate ID is required (e.g. ?candidateId=CAND001)." });

            // ✅ FIX: Remove CandidateId from validation since we set it manually
            ModelState.Remove(nameof(Skill.CandidateId));

            var employeeExists = await _context.Candidates.AnyAsync(e => e.Id == targetGuid);
            if (!employeeExists) return BadRequest(new { message = "Candidate profile not found." });

            if (skillData == null) skillData = new Skill();
            
            // ✅ Force the resolved Guid onto the model
            skillData.CandidateId = targetGuid.Value;

            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.CandidateId == targetGuid.Value);

            if (existingSkill != null)
            {
                existingSkill.OfficeSkills = skillData.OfficeSkills;
                existingSkill.OtherRelevantSkills = skillData.OtherRelevantSkills;
                existingSkill.OtherSkillInformation = skillData.OtherSkillInformation;
                existingSkill.UpdatedAt = DateTime.UtcNow;
                existingSkill.CandidateId = targetGuid.Value; 

                _context.Skills.Update(existingSkill);
            }
            else
            {
                skillData.Id = 0; 
                skillData.CandidateId = targetGuid.Value;
                skillData.CreatedAt = DateTime.UtcNow;
                await _context.Skills.AddAsync(skillData);
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Skill details saved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving data", error = ex.Message });
            }
        }
    }
}