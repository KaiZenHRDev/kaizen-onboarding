// fileName: Maps/PositionMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class PositionMap : ClassMap<CodeRecord>
    {
        public PositionMap()
        {
            // Maps CSV headers to the internal CodeRecord properties,
            // which eventually map to Position.Code (poscode) and Position.Name (posname)
            Map(m => m.Code).Name("code", "jobcode");
            Map(m => m.Name).Name("name", "jobpost", "position");
        }
    }
}