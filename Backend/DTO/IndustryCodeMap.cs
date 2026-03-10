// fileName: IndustryCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class IndustryCodeMap : ClassMap<CodeRecord>
    {
        public IndustryCodeMap()
        {
            Map(m => m.Code).Name("indstrycode");
            Map(m => m.Name).Name("indstryname");
        }
    }
}