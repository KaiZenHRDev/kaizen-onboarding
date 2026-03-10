// fileName: Maps/JobGradeCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class JobGradeCodeMap : ClassMap<CodeRecord>
    {
        public JobGradeCodeMap()
        {
            Map(m => m.Code).Name("gradecode");
            Map(m => m.Name).Name("gradename");
        }
    }
}