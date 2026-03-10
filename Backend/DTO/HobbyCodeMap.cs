// fileName: HobbyCodeMap.cs (Ensure this is in RecruitmentBackend.Maps)
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class HobbyCodeMap : ClassMap<CodeRecord>
    {
        public HobbyCodeMap()
        {
            Map(m => m.Code).Name("hbycode");
            Map(m => m.Name).Name("hbyname");
        }
    }
}