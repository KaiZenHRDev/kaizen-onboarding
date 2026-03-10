// fileName: Maps/PensionCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class PensionCodeMap : ClassMap<CodeRecord>
    {
        public PensionCodeMap()
        {
            // Only mapping Code as the PensionCode model does not contain a Name/Desc column
            Map(m => m.Code).Name("pesncode");
        }
    }
}