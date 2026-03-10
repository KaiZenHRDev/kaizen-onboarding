// fileName: MaritalStatusMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class MaritalStatusMap : ClassMap<CodeRecord>
    {
        public MaritalStatusMap()
        {
            Map(m => m.Code).Name("marstacode");
            Map(m => m.Name).Name("marstaname");
        }
    }
}