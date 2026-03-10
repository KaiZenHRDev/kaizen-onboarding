// fileName: CountryOriginMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class CountryOriginMap : ClassMap<CodeRecord>
    {
        public CountryOriginMap()
        {
            Map(m => m.Code).Name("ctyorgcode");
            Map(m => m.Name).Name("ctyorgname");
        }
    }
}