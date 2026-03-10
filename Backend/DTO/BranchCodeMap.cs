// fileName: Maps/BranchCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class BranchCodeMap : ClassMap<CodeRecord>
    {
        public BranchCodeMap()
        {
            Map(m => m.Code).Name("brhloccode");
            Map(m => m.Name).Name("brhlocname");
        }
    }
}