// fileName: Maps/EpfCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class EpfCodeMap : ClassMap<CodeRecord>
    {
        public EpfCodeMap()
        {
            Map(m => m.Code).Name("epfcode");
            Map(m => m.Name).Name("descrip");
        }
    }
}