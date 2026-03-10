// fileName: Maps/DepartmentCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class DepartmentCodeMap : ClassMap<CodeRecord>
    {
        public DepartmentCodeMap()
        {
            Map(m => m.Code).Name("departcode");
            Map(m => m.Name).Name("departname");
        }
    }
}