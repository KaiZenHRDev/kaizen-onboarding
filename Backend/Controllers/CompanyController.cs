// fileName: Backend/Controllers/CompanyController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace RecruitmentBackend.Controllers
{
    public class CompanyCreateDto
    {
        public required string CompanyId { get; set; }
        public required string CompanyName { get; set; }
        public string? CompanyDetails { get; set; } 
        public string? ColourCode { get; set; } 
        public IFormFile? Logo { get; set; }
    }

    public class CompanyUpdateDto
    {
        public required string CompanyName { get; set; }
        public string? CompanyDetails { get; set; } 
        public string? ColourCode { get; set; } 
        public IFormFile? Logo { get; set; }
    }

    [ApiController]
    [Route("api/companies/{companyId}/[controller]")] 
    public class CompanyController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Removed IWebHostEnvironment since we no longer save physical files to wwwroot
        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GLOBAL ROUTES (Using ~/ to override prefix)
        // ==========================================

        [HttpGet("~/api/company")]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _context.Companies.ToListAsync();
            return Ok(companies);
        }

        [HttpGet("~/api/company/{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            // Guard for SuperAdmin virtual sessions
            if (id.Equals("SYSTEM", StringComparison.OrdinalIgnoreCase)) 
            {
                return Ok(new { CompanyId = "SYSTEM", CompanyName = "System Administration" });
            }

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyId == id);
            
            if (company == null) 
            {
                return NotFound(new { message = $"Company ID '{id}' is not registered." });
            }
            
            return Ok(company);
        }

        [HttpPost("~/api/company")]
        public async Task<IActionResult> Create([FromForm] CompanyCreateDto dto)
        {
            if (await _context.Companies.AnyAsync(c => c.CompanyId == dto.CompanyId))
            {
                return BadRequest(new { message = "Company ID already exists." });
            }

            // Convert the uploaded file to a Base64 string directly
            string? logoBase64 = await ConvertToBase64(dto.Logo);

            var company = new Company
            {
                CompanyId = dto.CompanyId,
                CompanyName = dto.CompanyName,
                CompanyDetails = dto.CompanyDetails,
                ColourCode = dto.ColourCode, 
                LogoPath = logoBase64, // Storing the Base64 string in the existing column
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Company created successfully!", company });
        }

        [HttpPut("~/api/company/{id}")]
        public async Task<IActionResult> Update(string id, [FromForm] CompanyUpdateDto dto)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyId == id);
            if (company == null) return NotFound(new { message = "Company not found." });

            company.CompanyName = dto.CompanyName;
            company.CompanyDetails = dto.CompanyDetails;
            company.ColourCode = dto.ColourCode; 
            company.UpdatedAt = DateTime.UtcNow;

            if (dto.Logo != null)
            {
                company.LogoPath = await ConvertToBase64(dto.Logo);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Update successful", company });
        }
        
        [HttpDelete("~/api/company/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyId == id);
            
            if (company == null) return NotFound(new { message = "Company not found." });

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Company deleted successfully." }); 
        }

        // Helper method to convert IFormFile to a Base64 string format suitable for HTML img tags
        private async Task<string?> ConvertToBase64(IFormFile? logo)
        {
            if (logo == null || logo.Length == 0) return null;

            using (var memoryStream = new MemoryStream())
            {
                await logo.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();
                string base64String = Convert.ToBase64String(fileBytes);
                
                // Return a formatted Data URI so the React frontend can render it immediately
                return $"data:{logo.ContentType};base64,{base64String}";
            }
        }
    }
}