// fileName: Maps/GL2CodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class GL2CodeMap : ClassMap<CodeRecord>
    {
        public GL2CodeMap()
        {
            Map(m => m.Code).Name("glseg2code");
            Map(m => m.Name).Name("glseg2name");
        }
    }
}