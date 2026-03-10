// fileName: Maps/GL1CodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class GL1CodeMap : ClassMap<CodeRecord>
    {
        public GL1CodeMap()
        {
            Map(m => m.Code).Name("glseg1code");
            Map(m => m.Name).Name("glseg1name");
        }
    }
}