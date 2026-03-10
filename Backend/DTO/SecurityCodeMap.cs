// fileName: Maps/SecurityCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class SecurityCodeMap : ClassMap<CodeRecord>
    {
        public SecurityCodeMap()
        {
            Map(m => m.Code).Name("grpid");
            Map(m => m.Name).Name("grpname");
        }
    }
}