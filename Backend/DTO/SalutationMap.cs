// fileName: SalutationMap.cs

using CsvHelper.Configuration;
using RecruitmentBackend.Models; // Ensure the namespace is correct

namespace RecruitmentBackend.Maps
{
    public sealed class SalutationMap : ClassMap<CodeRecord>
    {
        public SalutationMap()
        {
            Map(m => m.Code).Name("salucode");
            Map(m => m.Name).Name("saludesc");
        }
    }
}