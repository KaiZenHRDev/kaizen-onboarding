using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Services; // Ensure ITenantContext is available
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace RecruitmentBackend.Controllers
{
    // 1. UPDATE ROUTE: Includes {companyId}
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class ThanksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenant; // 2. INJECT TENANT

        public ThanksController(AppDbContext context, ITenantContext tenant)
        {
            _context = context;
            _tenant = tenant;
        }

        // GET: api/companies/{companyId}/Thanks/settings
        // FIXED: Removed "{companyId}" to avoid duplicate route parameter error
        [HttpGet("settings")] 
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetThanksSettings()
        {
            // 3. SECURE GET: Use Tenant Context
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId))
            {
                return BadRequest(new { Message = "Company Context is missing." });
            }

            var settings = await _context.ThanksPages
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            // If no settings exist yet, return a new object with correct ID
            if (settings == null)
            {
                return Ok(new ThanksPage { CompanyId = companyId });
            }

            return Ok(settings);
        }

        // POST: api/companies/{companyId}/Thanks/settings
        [HttpPost("settings")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> UpdateThanksSettings([FromBody] ThanksPage request)
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId))
                return BadRequest(new { Message = "Company Context is missing." });

            // 4. FORCE TENANT ID on the incoming request
            request.CompanyId = companyId;

            var settings = await _context.ThanksPages
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            if (settings == null)
            {
                settings = new ThanksPage 
                { 
                    Id = Guid.NewGuid(),
                    CompanyId = companyId 
                };
                _context.ThanksPages.Add(settings);
            }

            // Map the allowed fields
            settings.ThanksTitle = request.ThanksTitle;
            settings.ThanksMessage = request.ThanksMessage;
            settings.NextStepsMessage = request.NextStepsMessage;
            settings.ThanksFooter = request.ThanksFooter;
            settings.UpdatedAt = DateTime.UtcNow;

            try 
            {
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Thanks page content published successfully.", Data = settings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error saving to database.", Details = ex.Message });
            }
        }

        // GET: api/companies/{companyId}/Thanks/public
        // FIXED: Removed "{companyId}" from here too
        [HttpGet("public")] 
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicThanksContent()
        {
            var companyId = _tenant.CompanyId;
            if (string.IsNullOrEmpty(companyId))
                return BadRequest(new { Message = "Company Context is missing." });

            var settings = await _context.ThanksPages
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.CompanyId == companyId);

            // Return consistent professional defaults if no custom settings exist
            if (settings == null)
            {
                return Ok(new 
                { 
                    ThanksTitle = "Application Successful!", 
                    ThanksMessage = "Your application has been received and is now under review by our recruitment team. We will contact you shortly if your profile matches our requirements.",
                    NextStepsMessage = "Our team will review your submission and contact you directly via the email or phone number provided.",
                    ThanksFooter = "Thank you for choosing to grow with us." 
                });
            }

            return Ok(new 
            { 
                settings.ThanksTitle, 
                settings.ThanksMessage,
                settings.NextStepsMessage,
                settings.ThanksFooter 
            });
        }
    }
}