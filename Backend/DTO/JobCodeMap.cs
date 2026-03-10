// fileName: JobCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class JobCodeMap : ClassMap<CodeRecord>
    {
        // In JobCodeMap.cs
        public JobCodeMap()
        {
            Map(m => m.Code).Name("jobcode");
            Map(m => m.Name).Name("jobpost");
        }
    }
}