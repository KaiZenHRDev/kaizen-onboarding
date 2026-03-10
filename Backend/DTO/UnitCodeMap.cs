// fileName: Maps/UnitCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class UnitCodeMap : ClassMap<CodeRecord>
    {
        public UnitCodeMap()
        {
            Map(m => m.Code).Name("unitcode");
            Map(m => m.Name).Name("unitname");
        }
    }
}