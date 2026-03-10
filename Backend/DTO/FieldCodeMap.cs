using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class FieldCodeMap : ClassMap<CodeRecord>
    {
        public FieldCodeMap()
        {
            Map(m => m.Code).Name("fldareaid");
            Map(m => m.Name).Name("fldareaname");
        }
    }
}