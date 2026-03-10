// fileName: Maps/VECodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class VECodeMap : ClassMap<CodeRecord>
    {
        public VECodeMap()
        {
            // Only mapping Code as the VECode model does not contain a Name/Desc column
            Map(m => m.Code).Name("vecode");
        }
    }
}