// fileName: Data/TableMapper.cs
using System;
using System.Collections.Generic;
using RecruitmentBackend.Models;
using System.Linq;

namespace RecruitmentBackend.Data
{
    public class TableMapper : ITableMapper
    {
        // This dictionary maps the database table name (string key) to the actual C# Entity Type (Type value)
        private static readonly Dictionary<string, Type> EntityMap = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
        {
            // Core Lookups
            { "salutation_code", typeof(Salutation) }, 
            { "marital_status_codes", typeof(MaritalStatus) },
            { "race_codes", typeof(Race) },
            { "religion_codes", typeof(Religion) },
            { "nationality_codes", typeof(Nationality) },
            { "country_origin_codes", typeof(CountryOrigin) },
            
            // Specialized Lookups
            { "qualification_codes", typeof(QualificationCode) }, 
            { "qualification_grades", typeof(QualificationGrade) },
            
            // Remaining Lookups
            { "industry_codes", typeof(Industry) },
            { "job_codes", typeof(Job) },
            { "position_codes", typeof(Position) }, 
            { "cessation_reasons", typeof(CessationReason) },
            { "hobby_codes", typeof(Hobby) },
            { "language_codes", typeof(Language) },
            { "field_area_codes", typeof(FieldArea) },

            // --- NEW BPO / HR Adapter Lookups ---
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
            { "socso_code", typeof(SocsoCode) },
            { "statutory_code", typeof(StatutoryCode) }
        };

        public Type GetEntityType(string tableName)
        {
            EntityMap.TryGetValue(tableName, out Type? type);
            return type!;
        }

        public string GetTableName(Type entityType)
        {
            // Reverse lookup: Find the key (table name)
            return EntityMap.FirstOrDefault(x => x.Value == entityType).Key;
        }
    }
}