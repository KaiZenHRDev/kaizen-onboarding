// fileName: Maps/CompanyCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class CompanyCodeMap : ClassMap<CodeRecord>
    {
        public CompanyCodeMap()
        {
            Map(m => m.Code).Name("compnycode");
            Map(m => m.Name).Name("compnyname");
        }
    }
}