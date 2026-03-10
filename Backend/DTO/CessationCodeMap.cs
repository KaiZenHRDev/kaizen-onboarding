// fileName: Maps/CessationCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class CessationCodeMap : ClassMap<CodeRecord>
    {
        public CessationCodeMap()
        {
            Map(m => m.Code).Name("rsgnrsncode");
            Map(m => m.Name).Name("rsgnrsndesc");
        }
    }
}