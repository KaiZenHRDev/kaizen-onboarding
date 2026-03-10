// fileName: RaceMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class RaceMap : ClassMap<CodeRecord>
    {
        public RaceMap()
        {          
            Map(m => m.Code).Name("racecode");
            Map(m => m.Name).Name("racename");
        }
    }
}