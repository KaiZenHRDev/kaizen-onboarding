using CsvHelper.Configuration;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Maps
{
  
    public sealed class QualificationCodeMap : ClassMap<QualificationCodeRecord>
    {
        public QualificationCodeMap()
        {
            Map(m => m.Code).Name("qlfcatid");
            Map(m => m.Name).Name("qlfcatname");
            Map(m => m.SubCode).Name("qlfsubid");
            Map(m => m.SubName).Name("qlfsubname");
        }
    }
}