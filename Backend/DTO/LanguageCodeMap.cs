using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class LanguageCodeMap : ClassMap<CodeRecord>
    {
        public LanguageCodeMap()
        {
            Map(m => m.Code).Name("langcode");
            Map(m => m.Name).Name("langname");
        }
    }
}