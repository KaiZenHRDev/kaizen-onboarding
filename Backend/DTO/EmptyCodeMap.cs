// fileName: Maps/EmptyCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class EmptyCodeMap : ClassMap<CodeRecord>
    {
        public EmptyCodeMap()
        {
            Map(m => m.Code).Name("emptypcode");
            Map(m => m.Name).Name("emptypname");
        }
    }
}