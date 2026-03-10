// fileName: Maps/PCBCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class PCBCodeMap : ClassMap<CodeRecord>
    {
        public PCBCodeMap()
        {
            Map(m => m.Code).Name("pcbtabcode");
            Map(m => m.Name).Name("pcbtabdesc");
        }
    }
}