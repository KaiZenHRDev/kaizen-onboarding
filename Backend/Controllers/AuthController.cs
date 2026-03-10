// fileName: Backend/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using RecruitmentBackend.Models.Dtos;
using RecruitmentBackend.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace RecruitmentBackend.Controllers
{
    [ApiController]
    [Route("api/companies/{companyId}/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public AuthController(
            AppDbContext context, 
            IConfiguration configuration, 
            AuthService authService)
        {
            _context = context;
            _configuration = configuration;
            _authService = authService;
        }

        [HttpPost("~/api/auth/register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (await _context.Users.AnyAsync(u => u.IcNumber == request.IcNumber))
                return BadRequest(new { message = "IC Number already registered." });

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
                return BadRequest(new { message = "Email already registered." });

            var user = new User
            {
                Email = request.Email,
                IcNumber = request.IcNumber,
                CandidateId = await _authService.GenerateCandidateIdAsync(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Candidate"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(string companyId, [FromBody] LoginRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.IcNumber == request.IcNumber);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            if (!string.IsNullOrEmpty(user.CompanyId) && 
                !string.Equals(user.CompanyId, companyId, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var profile = await _authService.EnsureCandidateProfileAsync(user);
            
            var token = GenerateJwtToken(user, companyId, profile.CandidateId);

            return Ok(new { 
                token, 
                userId = user.Id, 
                candidateId = profile.CandidateId, 
                companyId, 
                positionCode = request.PositionCode 
            });
        }

        [HttpPost("~/api/auth/login-admin")]
        public async Task<IActionResult> LoginAdmin([FromBody] LoginAdminRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Your account has been disabled. Please contact the System Administrator." });
            }

            if (user.Role != "Admin" && user.Role != "SuperAdmin")
            {
                return StatusCode(403, new { message = "Access Denied." });
            }

            var companyId = user.CompanyId ?? "SYSTEM";
            var token = GenerateJwtToken(user, companyId, null);

            return Ok(new { 
                token, 
                userId = user.Id, 
                role = user.Role, 
                companyId, 
                isFirstLogin = user.IsFirstLogin 
            });
        }

        [HttpPost("~/api/auth/forgot-password")]
        public async Task<IActionResult> ForgotPasswordCandidate([FromBody] ForgotPasswordCandidateDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IcNumber == request.IcNumber && u.Role == "Candidate");

            if (user == null)
                return NotFound(new { message = "Account with this IC Number not found." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        // ✅ UPDATED: Global Route for Admin Password Reset (Extracts CompanyId from the DTO body)
        [HttpPost("~/api/auth/admin/forgot-password")]
        public async Task<IActionResult> ForgotPasswordAdmin([FromBody] ForgotPasswordAdminDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Email.ToLower() == request.Email.ToLower() &&
                u.CompanyId == request.CompanyId &&
                (u.Role == "Admin" || u.Role == "SuperAdmin"));

            if (user == null)
                return NotFound(new { message = "Admin account not found or details do not match the specified company." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        [HttpGet("admins")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetAdmins(string companyId)
        {
            var admins = await _authService.GetAdminListAsync(companyId);
            return Ok(admins);
        }

        [HttpPost("create-admin")]
        [Authorize(Roles = "SuperAdmin")] 
        public async Task<IActionResult> CreateAdmin(string companyId, [FromBody] CreateAdminRequestDto request)
        {
            try
            {
                var success = await _authService.CreateAdminAsync(companyId, request);
                if (success)
                {
                    return Ok(new { message = "Administrative account successfully created and linked to " + companyId });
                }
                return StatusCode(500, new { message = "An unexpected error occurred while saving the account." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal Server Error: " + ex.Message });
            }
        }

        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var success = await _authService.DeleteAdminAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Admin deleted." });
        }

        [HttpPatch("admin/{id}/toggle-status")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var success = await _authService.ToggleAdminStatusAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Status updated." });
        }

        [HttpPost("~/api/auth/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            var user = await _context.Users.FindAsync(Guid.Parse(request.UserId));
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Invalid current password." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.IsFirstLogin = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password updated." });
        }

        private string GenerateJwtToken(User user, string companyId, string? candidateId)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role), 
                new Claim("Role", user.Role),
                new Claim("CompanyId", companyId)
            };
            if (candidateId != null) claims.Add(new Claim("CandidateId", candidateId));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha512)
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}