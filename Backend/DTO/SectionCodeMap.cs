// fileName: Maps/SectionCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class SectionCodeMap : ClassMap<CodeRecord>
    {
        public SectionCodeMap()
        {
            Map(m => m.Code).Name("sectiocode");
            Map(m => m.Name).Name("sectioname");
        }
    }
}