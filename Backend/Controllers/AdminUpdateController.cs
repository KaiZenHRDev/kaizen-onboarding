// fileName: Backend/Controllers/AdminUpdateController.cs
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using RecruitmentBackend.Data;
using RecruitmentBackend.Models;
using System;
using RecruitmentBackend.Maps; 
using System.Reflection; 
using RecruitmentBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore; 

namespace RecruitmentBackend.Controllers
{
    [Route("api/companies/{companyId}/[controller]")]
    [ApiController]
    public class AdminUpdateController : ControllerBase
    {
        private readonly DropdownRepository _repository;
        private readonly ITenantContext _tenant;
        private readonly AppDbContext _context; 

        private static readonly Dictionary<string, Type> CodeMaps = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
        {
            { "salutation_code", typeof(SalutationMap) }, 
            { "marital_status_codes", typeof(MaritalStatusMap) },
            { "race_codes", typeof(RaceMap) },
            { "nationality_codes", typeof(NationalityMap) },
            { "religion_codes", typeof(ReligionMap) },
            { "country_origin_codes", typeof(CountryOriginMap) },
            { "industry_codes", typeof(IndustryCodeMap) },
            { "job_codes", typeof(JobCodeMap) },
            { "position_codes", typeof(PositionMap) },
            { "cessation_reasons", typeof(CessationCodeMap) },
            { "hobby_codes", typeof(HobbyCodeMap) },
            { "language_codes", typeof(LanguageCodeMap) },
            { "field_area_codes", typeof(FieldCodeMap) },
            
            // --- NEW HR ADAPTER MAPPINGS ---
            { "pay_group_code", typeof(PayGroupCodeMap) },
            { "branch_code", typeof(BranchCodeMap) },
            { "company_code", typeof(CompanyCodeMap) },
            { "department_code", typeof(DepartmentCodeMap) },
            { "division_code", typeof(DivisionCodeMap) },
            { "empty_code", typeof(EmptyCodeMap) },
            { "epf_code", typeof(EpfCodeMap) },
            { "gl1_code", typeof(GL1CodeMap) },
            { "gl2_code", typeof(GL2CodeMap) },
            { "job_grade_code", typeof(JobGradeCodeMap) },
            { "unit_code", typeof(UnitCodeMap) },
            { "ve_code", typeof(VECodeMap) },
            { "pcb_code", typeof(PCBCodeMap) },
            { "pension_code", typeof(PensionCodeMap) },
            { "section_code", typeof(SectionCodeMap) },
            { "security_code", typeof(SecurityCodeMap) },
            { "socso_code", typeof(SocsoCodeMap) }
        };

        private static readonly Dictionary<string, Type> EntityTypes = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
        {
            { "salutation_code", typeof(Salutation) }, 
            { "marital_status_codes", typeof(MaritalStatus) },
            { "race_codes", typeof(Race) },
            { "nationality_codes", typeof(Nationality) },
            { "religion_codes", typeof(Religion) },
            { "country_origin_codes", typeof(CountryOrigin) },
            { "industry_codes", typeof(Industry) },
            { "job_codes", typeof(Job) },
            { "position_codes", typeof(Position) },
            { "cessation_reasons", typeof(CessationReason) },
            { "hobby_codes", typeof(Hobby) },
            { "language_codes", typeof(Language) },
            { "field_area_codes", typeof(FieldArea) },
            { "qualification_codes", typeof(QualificationCode) }, 
            { "qualification_grades", typeof(QualificationGrade) },
            
            // --- NEW HR ADAPTER ENTITIES ---
            { "pay_group_code", typeof(PayGroupCode) },
            { "branch_code", typeof(BranchCode) },
            { "company_code", typeof(CompanyCode) },
            { "department_code", typeof(DepartmentCode) },
            { "division_code", typeof(DivisionCode) },
            { "empty_code", typeof(EmptyCode) },
            { "epf_code", typeof(EpfCode) },
            { "gl1_code", typeof(GL1Code) },
            { "gl2_code", typeof(GL2Code) },
            { "job_grade_code", typeof(JobGradeCode) },
            { "unit_code", typeof(UnitCode) },
            { "ve_code", typeof(VECode) },
            { "pcb_code", typeof(PCBCode) },
            { "pension_code", typeof(PensionCode) },
            { "section_code", typeof(SectionCode) },
            { "security_code", typeof(SecurityCode) },
            { "socso_code", typeof(SocsoCode) }
        };

        public AdminUpdateController(DropdownRepository repository, ITenantContext tenant, AppDbContext context)
        {
            _repository = repository;
            _tenant = tenant;
            _context = context;
        }

        [HttpPost("upload/{tableName}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadCodes(string companyId, string tableName, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });
            if (string.IsNullOrWhiteSpace(companyId)) return BadRequest(new { message = "Company Context is missing." });

            try
            {
                // Updated CsvConfiguration: We deliberately removed `HeaderValidated = null` and `MissingFieldFound = null`
                // so that missing headers will actually throw exceptions instead of quietly failing.
                var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    PrepareHeaderForMatch = args => args.Header.ToLower()
                };

                using (var reader = new StreamReader(file.OpenReadStream()))
                using (var csv = new CsvReader(reader, csvConfig))
                {
                    if (tableName.Equals("qualification_codes", StringComparison.OrdinalIgnoreCase))
                    {
                        csv.Context.RegisterClassMap<QualificationCodeMap>(); 
                        var records = csv.GetRecords<QualificationCodeRecord>().ToList()
                            .GroupBy(x => new { x.Code, x.SubCode }).Select(g => g.Last()).ToList();
                        
                        var entities = records.Select(r => new QualificationCode { 
                            Code = r.Code, Name = r.Name, SubCode = r.SubCode, SubName = r.SubName, 
                            CreatedAt = DateTime.UtcNow, CompanyId = companyId 
                        }).ToList();
                        
                        int count = await _repository.ReplaceAllQualificationCodesAsync(entities); 
                        return Ok(new { message = $"{count} qualification codes synced successfully." });
                    }
                    else if (tableName.Equals("qualification_grades", StringComparison.OrdinalIgnoreCase))
                    {
                        csv.Context.RegisterClassMap<GradeCodeMap>(); 
                        var rawRecords = csv.GetRecords<GradeRecord>().ToList();
                        var records = rawRecords.GroupBy(x => x.GradeCode).Select(g => g.Last()).ToList();
                        
                        var entities = records.Select(r => new QualificationGrade { 
                            Code = r.GradeCode,
                            Description = !string.IsNullOrWhiteSpace(r.GradeRank) ? $"{r.GradeName} - {r.GradeRank}" : r.GradeName,
                            CreatedAt = DateTime.UtcNow,
                            CompanyId = companyId 
                        }).ToList();

                        int count = await _repository.ReplaceAllGradeCodesAsync(entities);
                        return Ok(new { message = $"{count} qualification grades synced successfully." });
                    }
                    else if (tableName.Equals("statutory_code", StringComparison.OrdinalIgnoreCase))
                    {
                        csv.Context.RegisterClassMap<StatutoryCodeMap>();
                        var rawRecords = csv.GetRecords<StatutoryCodeRecord>().ToList();
                        
                        // FIX: Group by Code and CompanyCode to eliminate the thousands of duplicate rows in the CSV
                        var records = rawRecords.GroupBy(x => new { x.Code, x.CompanyCode }).Select(g => g.Last()).ToList();
                        
                        var entities = records.Select(r => new StatutoryCode 
                        { 
                            Code = r.Code, 
                            CompanyCode = r.CompanyCode,
                            CompanyId = companyId,
                            CreatedAt = DateTime.UtcNow 
                        }).ToList();

                        int count = await _repository.ReplaceStatutoryCodesAsync(entities, companyId);
                        return Ok(new { message = $"{count} Statutory codes synced successfully." });
                    }
                    else if (CodeMaps.TryGetValue(tableName, out Type? mapType) && EntityTypes.TryGetValue(tableName, out Type? entityType))
                    {
                        csv.Context.RegisterClassMap(mapType);
                        var rawRecords = csv.GetRecords<CodeRecord>().ToList();
                        var records = rawRecords.GroupBy(r => r.Code).Select(g => g.Last()).ToList();
                        
                        var entities = records.Select(record => {
                            var entity = Activator.CreateInstance(entityType) ?? throw new InvalidOperationException();
                            entityType.GetProperty("Code")?.SetValue(entity, record.Code);
                            entityType.GetProperty("Name")?.SetValue(entity, record.Name);
                            entityType.GetProperty("CreatedAt")?.SetValue(entity, DateTime.UtcNow);
                            entityType.GetProperty("CompanyId")?.SetValue(entity, companyId);
                            return entity;
                        }).ToList();

                        var targetListType = typeof(List<>).MakeGenericType(entityType);
                        var targetList = Activator.CreateInstance(targetListType);
                        var addMethod = targetListType.GetMethod("Add");
                        foreach (var entity in entities) addMethod?.Invoke(targetList, new object[] { entity });

                        var method = _repository.GetType().GetMethods().FirstOrDefault(m => m.Name == "ReplaceAllCodesAsync" && m.IsGenericMethod);
                        var genericMethod = method!.MakeGenericMethod(entityType);
                        int count = await (Task<int>)genericMethod.Invoke(_repository, new object[] { tableName, targetList! })!;
                        
                        return Ok(new { message = $"{count} records synced successfully." });
                    }
                    return BadRequest(new { message = $"Table {tableName} is not configured." });
                }
            }
            // Explicitly handle mapping/header validation exceptions and return a 400 Bad Request
            catch (HeaderValidationException)
            {
                return BadRequest(new { message = "Incorrect CSV column format. Please check the required headers." });
            }
            // Fix: Fully qualified CsvHelper.MissingFieldException to resolve ambiguity with System.MissingFieldException
            catch (CsvHelper.MissingFieldException)
            {
                return BadRequest(new { message = "Missing required fields in the CSV data rows." });
            }
            catch (Exception ex) 
            { 
                return StatusCode(500, new { message = "CSV processing failed.", error = ex.Message }); 
            }
        }

        [HttpGet("status/{tableName}")]
        public async Task<IActionResult> GetTableStatus(string companyId, string tableName)
        {
             try { 
                 var lastUpdated = await _repository.GetLastUpdatedAsync(tableName, companyId); 
                 return Ok(new { TableName = tableName, LastUpdated = lastUpdated, HasData = lastUpdated.HasValue }); 
             } catch { 
                 return Ok(new { TableName = tableName, LastUpdated = (DateTime?)null, HasData = false }); 
             }
        }

        [HttpGet("options/{tableName}")]
        public async Task<IActionResult> GetDropdownOptions(string companyId, string tableName)
        {
             try {
                 var options = await _repository.GetAllOptionsAsync(tableName, companyId); 
                 return Ok(options.Select(o => new { Code = o.Code, Description = o.Name }));
             } catch (Exception ex) {
                 return StatusCode(500, new { message = "Fetch failed", error = ex.Message });
             }
        }

        [HttpGet("suboptions/{tableName}/{parentCode}")]
        public async Task<IActionResult> GetSubOptions(string companyId, string tableName, string parentCode)
        {
            if (string.IsNullOrEmpty(companyId)) return BadRequest(new { message = "Company Context is missing." });

            if (tableName.Equals("qualification_codes", StringComparison.OrdinalIgnoreCase))
            {
                var results = await _context.QualificationCodes
                    .Where(q => q.Code == parentCode && q.CompanyId == companyId)
                    .Select(q => new 
                    { 
                        Code = q.SubCode, 
                        Description = q.SubName 
                    })
                    .Distinct()
                    .ToListAsync();

                return Ok(results);
            }

            return BadRequest(new { message = $"Table '{tableName}' not supported for sub-options." });
        }

        // --- NEW ENDPOINT: Fetch Cascading Statutory Codes ---
        [HttpGet("options/statutory_code/{selectedCompanyCode}")]
        public async Task<IActionResult> GetStatutoryCodesByCompany(string companyId, string selectedCompanyCode)
        {
            var codes = await _context.StatutoryCodes
                .Where(x => x.CompanyId == companyId && x.CompanyCode == selectedCompanyCode)
                .Select(x => new { 
                    code = x.Code, 
                    name = x.Code // Duplicating code as name since frontend expects label/value pairs
                })
                .ToListAsync();

            return Ok(codes);
        }
    }
}