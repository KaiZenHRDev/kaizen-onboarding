// fileName: Backend/App.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using RecruitmentBackend.Data; 
using RecruitmentBackend.Middlewares;
using RecruitmentBackend.Services; // Contains ApplicationService & ITenantContext
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System; 
using Microsoft.AspNetCore.RateLimiting; 
using System.Threading.RateLimiting;
using System.Text.Json.Serialization; 

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
// Configure JSON to ignore reference cycles
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
    
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<ITableMapper, TableMapper>(); 

builder.Services.AddScoped<DropdownRepository>();

// Register ApplicationService
builder.Services.AddScoped<ApplicationService>();
builder.Services.AddScoped<AuthService>();

// --- TENANT RESOLUTION LAYER ---
// 1. Required to access HttpContext in services
builder.Services.AddHttpContextAccessor(); 

// 2. Register the TenantContext
builder.Services.AddScoped<ITenantContext, TenantContext>();
// -------------------------------

// Rate Limiter Configuration
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    // Strict Policy for Login/Register (Brute force protection)
    options.AddFixedWindowLimiter("LoginPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5; 
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // General Policy for other endpoints
    options.AddFixedWindowLimiter("GeneralPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 100;
        opt.QueueLimit = 2;
    });
});

// CORS CONFIGURATION
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var frontendUrl = builder.Configuration["FRONTEND_URL"];

        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:3000") 
                  .AllowAnyHeader()
                  .AllowAnyMethod(); 
        }
        else if (!string.IsNullOrEmpty(frontendUrl))
        {
            policy.WithOrigins(frontendUrl)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration.GetValue<string>("Jwt:Key") 
                ?? throw new InvalidOperationException("JWT Key is not configured."))),
            
            ValidateIssuer = false, 
            ValidateAudience = false, 
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero 
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// 3. Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<UtcDateTimeMiddleware>();

app.UseRateLimiter();

app.UseCors("AllowFrontend"); 

app.UseStaticFiles(); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();