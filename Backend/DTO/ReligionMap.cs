// fileName: ReligionMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class ReligionMap : ClassMap<CodeRecord>
    {
        public ReligionMap()
        {
            Map(m => m.Code).Name("religncode");
            Map(m => m.Name).Name("relignname");
        }
    }
}