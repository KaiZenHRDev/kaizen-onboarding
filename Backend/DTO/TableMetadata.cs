// fileName: Models/TableMetadata.cs

using System; 
using System.Collections.Generic;
using System.Linq; 

namespace RecruitmentBackend.Models
{
    public class TableMetadata
    {
        // Maps the API dropdown name (snake_case from frontend) to the 
        // actual database table/model name (PascalCase for SQL)
        private static readonly Dictionary<string, string> TABLE_MAP = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Existing Mappings
            { "race_codes", "RaceCode" }, 
            { "nationality_codes", "NationalityCode" }, 
            { "qualification_codes", "qualification_codes" }, 
            { "salutation", "salutation_code" } ,
            
            // MAPPINGS from AdminUpdate.js fields
            { "marital_status_codes", "MaritalStatusCode" },
            { "religion_codes", "ReligionCode" },
            { "country_origin_codes", "CountryOriginCode" },
            { "qualification_grades", "QualificationGradeCode" },
            { "industry_codes", "IndustryCode" },
            { "job_codes", "JobCode" },
            { "position_code", "PositionCode" }, 
            { "cessation_reasons", "CessationReason" },
            { "hobby_codes", "HobbyCode" },
            { "language_codes", "LanguageCode" },
            { "field_area_codes", "FieldAreaCode" },

            // --- NEW BPO / HR Adapter Mappings ---
            { "pay_group_code", "PayGroupCode" },
            { "branch_code", "BranchCode" },
            { "company_code", "CompanyCode" },
            { "department_code", "DepartmentCode" },
            { "division_code", "DivisionCode" },
            { "empty_code", "EmptyCode" },
            { "epf_code", "EpfCode" },
            { "gl1_code", "GL1Code" },
            { "gl2_code", "GL2Code" },
            { "job_grade_code", "JobGradeCode" },
            { "unit_code", "UnitCode" },
            { "ve_code", "VECode" },
            { "pcb_code", "PCBCode" },
            { "pension_code", "PensionCode" },
            { "section_code", "SectionCode" },
            { "security_code", "SecurityCode" },
            { "socso_code", "SocsoCode" },
            { "statutory_code", "StatutoryCode" }
        };

        public string TableName { get; set; } = null!;
        
        public DateTime? LastUpdated { get; set; }
        public bool HasData { get; set; }

        public static string GetTableName(string dropdownName)
        {
            // Safely retrieve the mapped PascalCase table name.
            if (TABLE_MAP.TryGetValue(dropdownName, out string? tableName)) 
            {
                // Assert that the retrieved value is non-null before returning.
                return tableName!;
            }
            throw new KeyNotFoundException($"No table mapping found for '{dropdownName}'");
        }
    }
}