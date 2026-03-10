// fileName: NationalityMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class NationalityMap : ClassMap<CodeRecord>
    {
        public NationalityMap()
        {
            Map(m => m.Code).Name("nationcode");
            Map(m => m.Name).Name("nationame");
        }
    }
}