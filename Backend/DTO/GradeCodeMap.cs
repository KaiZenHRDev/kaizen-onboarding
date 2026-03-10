// fileName: GradeCodeMap.cs (Ensure this is in RecruitmentBackend.Maps)
using CsvHelper.Configuration;
using RecruitmentBackend.Models; // Required to find GradeRecord

namespace RecruitmentBackend.Maps
{
    public sealed class GradeCodeMap : ClassMap<GradeRecord>
    {
        public GradeCodeMap()
        {
            Map(m => m.GradeCode).Name("qlfgradecode");
            Map(m => m.GradeName).Name("qlfgradename");
            Map(m => m.GradeRank).Name("qlfgraderank");
        }
    }
}