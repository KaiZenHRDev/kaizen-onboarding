// fileName: Backend/Data/DropdownRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using RecruitmentBackend.Models;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentBackend.Data
{
    public class DropdownRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly ITableMapper _tableMapper;

        private static readonly Dictionary<string, (string Code, string Name)> ColumnMap = 
            new Dictionary<string, (string, string)>(StringComparer.OrdinalIgnoreCase)
        {
            // --- Original Mappings ---
            { "salutation_code", ("salucode", "saludesc") },
            { "marital_status_codes", ("marstacode", "marstaname") },
            { "race_codes", ("racecode", "racename") },
            { "religion_codes", ("religncode", "relignname") },
            { "nationality_codes", ("nationcode", "nationame") },
            { "country_origin_codes", ("ctyorgcode", "ctyorgname") },
            { "industry_codes", ("indstrycode", "indstryname") },
            { "job_codes", ("jobcode", "jobpost") },
            { "position_codes", ("jobcode", "jobpost") },
            { "cessation_reasons", ("rsgnrsncode", "rsgnrsndesc") },
            { "hobby_codes", ("hbycode", "hbyname") },
            { "language_codes", ("langcode", "langname") },
            { "field_area_codes", ("fldareaid", "fldareaname") },
            { "qualification_grades", ("qlfgradecode", "qlfgradename") },

            // --- NEW BPO / HR Adapter Mappings ---
            { "pay_group_code", ("paygrpcode", "descrip") },
            { "branch_code", ("brhloccode", "brhlocname") },
            { "company_code", ("compnycode", "compnyname") },
            { "department_code", ("departcode", "departname") },
            { "division_code", ("divisncode", "divisnname") },
            { "empty_code", ("emptypcode", "emptypname") },
            { "epf_code", ("epfcode", "descrip") },
            { "gl1_code", ("glseg1code", "glseg1name") },
            { "gl2_code", ("glseg2code", "glseg2name") },
            { "job_grade_code", ("gradecode", "gradename") },
            { "unit_code", ("unitcode", "unitname") },
            { "ve_code", ("vecode", "vecode") }, 
            { "pcb_code", ("pcbtabcode", "pcbtabdesc") },
            { "pension_code", ("pesncode", "pesncode") }, 
            { "section_code", ("sectiocode", "sectioname") },
            { "security_code", ("grpid", "grpname") },
            { "socso_code", ("soctabcode", "soctabdesc") },
            { "statutory_code", ("corefcode", "compnycode") } // Updated to map compnycode to Name for cascading
        };

        public DropdownRepository(AppDbContext dbContext, ITableMapper tableMapper)
        {
            _dbContext = dbContext;
            _tableMapper = tableMapper;
        }

        public async Task ApplyCascadingRulesForTableAsync(string tableName)
        {
             await Task.CompletedTask; 
        }

        // ==================================================================================
        // 2. SYNC LOGIC
        // ==================================================================================

        public async Task<int> ReplaceAllCodesAsync<TEntity>(string tableName, List<TEntity> newRecords) where TEntity : class
        {
            var dbSet = _dbContext.Set<TEntity>();
            var modelType = typeof(TEntity);
            var isActiveProp = modelType.GetProperty("IsActive");
            
            // Check if input has CompanyId
            string? targetCompanyId = null;
            if (newRecords.Any())
            {
                var companyIdProp = modelType.GetProperty("CompanyId");
                if (companyIdProp != null)
                {
                    var firstVal = companyIdProp.GetValue(newRecords.First());
                    if (firstVal != null) targetCompanyId = firstVal.ToString();
                }
            }

            // Retrieve existing records
            var allData = await dbSet.ToListAsync();
            
            // Filter in memory to handle dynamic CompanyId check
            var existingRecords = allData.Where(r => 
            {
                 var p = r.GetType().GetProperty("CompanyId");
                 var v = p?.GetValue(r);
                 return targetCompanyId == null ? v == null : v?.ToString() == targetCompanyId;
            }).ToList();

            // 1. Mark existing as inactive if property exists
            if (isActiveProp != null && isActiveProp.CanWrite)
            {
                foreach (var existing in existingRecords)
                {
                    isActiveProp.SetValue(existing, false);
                }
            }

            // 2. Upsert logic
            foreach (var newRecord in newRecords)
            {
                var codeProp = modelType.GetProperty("Code");
                if (codeProp == null) continue;

                string codeValue = codeProp.GetValue(newRecord)?.ToString() ?? "";
                
                // Find match
                var existingEntity = existingRecords.FirstOrDefault(e => 
                    (modelType.GetProperty("Code")?.GetValue(e)?.ToString() ?? "") == codeValue
                );

                if (existingEntity != null)
                {
                    _dbContext.Entry(existingEntity).CurrentValues.SetValues(newRecord);
                    isActiveProp?.SetValue(existingEntity, true);
                }
                else
                {
                    isActiveProp?.SetValue(newRecord, true);
                    dbSet.Add(newRecord);
                }
            }
            
            return await _dbContext.SaveChangesAsync();
        }

        public async Task<int> ReplaceAllQualificationCodesAsync(List<QualificationCode> newRecords)
        {
            var dbSet = _dbContext.Set<QualificationCode>();
            string? targetCompanyId = newRecords.FirstOrDefault()?.CompanyId;

            // Simple Where clause since we know the Type
            var existingRecords = await dbSet
                .Where(q => targetCompanyId == null ? q.CompanyId == null : q.CompanyId == targetCompanyId)
                .ToListAsync();

            foreach (var newRecord in newRecords)
            {
                var existingEntity = existingRecords.FirstOrDefault(q => 
                    q.Code == newRecord.Code && q.SubCode == newRecord.SubCode);

                if (existingEntity != null)
                {
                    existingEntity.Name = newRecord.Name;
                    existingEntity.SubName = newRecord.SubName;
                }
                else
                {
                    dbSet.Add(newRecord);
                }
            }

            return await _dbContext.SaveChangesAsync();
        }

        public async Task<int> ReplaceAllGradeCodesAsync(List<QualificationGrade> newRecords) => 
            await ReplaceAllCodesAsync<QualificationGrade>("qualification_grades", newRecords);
        
        // --- NEW: Handle Statutory Code Replacements ---
        public async Task<int> ReplaceStatutoryCodesAsync(List<StatutoryCode> newRecords, string companyId)
        {
            var dbSet = _dbContext.Set<StatutoryCode>();
            
            // Remove existing records for the current tenant to prevent PK conflicts on re-upload
            var oldRecords = await dbSet.Where(x => x.CompanyId == companyId).ToListAsync();
            dbSet.RemoveRange(oldRecords);
            
            await dbSet.AddRangeAsync(newRecords);
            return await _dbContext.SaveChangesAsync();
        }

        // ==================================================================================
        // 3. FETCH METHODS
        // ==================================================================================

        public async Task<List<QualificationCodeRecord>> GetQualificationSubOptionsAsync(string mainCode, string? companyId)
        {
            var query = _dbContext.QualificationCodes.AsNoTracking().Where(q => q.Code == mainCode);

            if (!string.IsNullOrEmpty(companyId))
                query = query.Where(q => q.CompanyId == companyId || q.CompanyId == null);
            else
                query = query.Where(q => q.CompanyId == null);

            return await query
                .Select(q => new QualificationCodeRecord {
                    Code = q.Code, Name = q.Name, SubCode = q.SubCode, SubName = q.SubName
                })
                .OrderBy(q => q.SubName)
                .ToListAsync();
        }

        public async Task<List<CodeRecord>> GetAllOptionsAsync(string tableName, string? companyId)
        {
            // Fix: handle potential null return from TableMapper
            Type? entityType = _tableMapper.GetEntityType(tableName);
            if (entityType == null) throw new ArgumentException($"Table {tableName} not mapped.");

            bool hasIsActive = entityType.GetProperty("IsActive") != null;

            // Special handling for Qualification Codes which are distinct by Code/Name ignoring SubCode
            if (tableName.Equals("qualification_codes", StringComparison.OrdinalIgnoreCase))
            {
                 var query = _dbContext.QualificationCodes.AsNoTracking();

                 if (!string.IsNullOrEmpty(companyId))
                     query = query.Where(q => q.CompanyId == companyId || q.CompanyId == null);
                 else
                     query = query.Where(q => q.CompanyId == null);

                 return await query
                    .Select(q => new { q.Code, q.Name })
                    .Distinct()
                    .OrderBy(o => o.Name)
                    .Select(o => new CodeRecord { Code = o.Code, Name = o.Name })
                    .ToListAsync();
            }
            
            if (!ColumnMap.TryGetValue(tableName, out var columns))
                throw new KeyNotFoundException($"Column mapping not found for table {tableName}.");
            
            // Raw SQL allows us to query tables dynamically without generic DbSet overhead
            string companyFilter = !string.IsNullOrEmpty(companyId) 
                ? $"(\"company_id\" = '{companyId}' OR \"company_id\" IS NULL)"
                : "\"company_id\" IS NULL";

            string activeFilter = hasIsActive ? " AND \"is_active\" = true" : "";

            string selectSql = $@"
                SELECT DISTINCT ""{columns.Code}"" AS ""Code"", ""{columns.Name}"" AS ""Name"" 
                FROM ""{tableName}"" 
                WHERE {companyFilter}{activeFilter}
                ORDER BY ""{columns.Name}"" ASC";

            return await _dbContext.Database
                .SqlQueryRaw<CodeRecord>(selectSql)
                .AsNoTracking()
                .ToListAsync();
        }
        
        public async Task<DateTime?> GetLastUpdatedAsync(string tableName, string? companyId)
        {
            Type? entityType = _tableMapper.GetEntityType(tableName);
            if (entityType == null) return null;
            
            bool hasIsActive = entityType.GetProperty("IsActive") != null;

            string companyFilter = !string.IsNullOrEmpty(companyId) 
                ? $"\"company_id\" = '{companyId}'"
                : "\"company_id\" IS NULL";

            string activeFilter = hasIsActive ? " AND \"is_active\" = true" : "";

            string sql = $"SELECT MAX(\"created_at\") AS \"Value\" FROM \"{tableName}\" WHERE {companyFilter}{activeFilter}";

            try { return await _dbContext.Database.SqlQueryRaw<DateTime?>(sql).SingleOrDefaultAsync(); }
            catch { return null; }
        }
    }
}