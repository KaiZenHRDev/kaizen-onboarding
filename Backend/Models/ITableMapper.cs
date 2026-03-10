// fileName: Data/ITableMapper.cs
using System;
using RecruitmentBackend.Models;

namespace RecruitmentBackend.Data
{
    // Interface required by DropdownRepository and implemented by TableMapper
    public interface ITableMapper
    {
        Type GetEntityType(string tableName);
        string GetTableName(Type entityType);
    }
}