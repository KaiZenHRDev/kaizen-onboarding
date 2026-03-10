// fileName: Maps/DivisionCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class DivisionCodeMap : ClassMap<CodeRecord>
    {
        public DivisionCodeMap()
        {
            Map(m => m.Code).Name("divisncode");
            Map(m => m.Name).Name("divisnname");
        }
    }
}