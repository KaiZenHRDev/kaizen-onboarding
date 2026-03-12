// fileName: Backend/Controllers/CompanyController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting; // Added back for wwwroot access
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
        private readonly IWebHostEnvironment _environment; // Added back to get folder paths

        public CompanyController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
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

            // Save the physical file to the server and get the URL path
            string? logoPath = await SaveLogo(dto.Logo);

            var company = new Company
            {
                CompanyId = dto.CompanyId,
                CompanyName = dto.CompanyName,
                CompanyDetails = dto.CompanyDetails,
                ColourCode = dto.ColourCode, 
                LogoPath = logoPath, // Storing physical path (e.g., /uploads/xyz.png)
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
                company.LogoPath = await SaveLogo(dto.Logo);
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

        // Helper method to save physical files to wwwroot/uploads
        private async Task<string?> SaveLogo(IFormFile? logo)
        {
            if (logo == null || logo.Length == 0) return null;

            // Get the wwwroot path securely
            string webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileExtension = Path.GetExtension(logo.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await logo.CopyToAsync(stream);
            }

            // Return relative URL for frontend to use
            return $"/uploads/{uniqueFileName}";
        }
    }
}