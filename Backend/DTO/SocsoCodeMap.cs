// fileName: Maps/SocsoCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class SocsoCodeMap : ClassMap<CodeRecord>
    {
        public SocsoCodeMap()
        {
            Map(m => m.Code).Name("soctabcode");
            Map(m => m.Name).Name("soctabdesc");
        }
    }
}