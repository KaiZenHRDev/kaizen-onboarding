// fileName: Maps/StatutoryCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class StatutoryCodeMap : ClassMap<StatutoryCodeRecord>
    {
        public StatutoryCodeMap()
        {
            Map(m => m.Code).Name("corefcode");
            Map(m => m.CompanyCode).Name("compnycode");
        }
    }
}