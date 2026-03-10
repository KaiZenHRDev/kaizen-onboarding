// fileName: Maps/PayGroupCodeMap.cs
using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
    public sealed class PayGroupCodeMap : ClassMap<CodeRecord>
    {
        public PayGroupCodeMap()
        {
            Map(m => m.Code).Name("paygrpcode");
            Map(m => m.Name).Name("descrip");
        }
    }
}