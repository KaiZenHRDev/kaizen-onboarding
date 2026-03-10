// fileName: EmployeeListUtils.js

/**
 * Standardizes property access (handles camelCase or PascalCase from backend)
 */
export const getValue = (obj, key) => {
  if (!obj) return null;
  return obj[key] || obj[key.charAt(0).toUpperCase() + key.slice(1)];
};

/**
 * HELPER: Generates the base URL for multi-tenant routes.
 * Use this to build your fetch calls.
 * Pattern: /api/companies/{companyId}/{controller}
 */
export const getTenantBaseUrl = (controller) => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
        console.error("Missing Company ID in storage for tenant route:", controller);
        return `/api/${controller}`; // Fallback to global if CID is missing
    }
    return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
};

/**
 * Creates a unique composite key for React lists.
 * Distinguishes the same candidate applying for different positions.
 */
export const getUniqueKey = (emp) => 
    `${emp.candidateId}|${emp.companyId}|${emp.positionCode || 'NULL'}`;

/**
 * Decodes the composite key back into its components.
 */
export const parseUniqueKey = (key) => {
    const [candidateId, companyId, positionCode] = key.split('|');
    return { 
        candidateId, 
        companyId, 
        positionCode: positionCode === 'NULL' ? null : positionCode 
    };
};

/**
 * Formats dates for display (DD/MM/YYYY)
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
};

/**
 * Formats dates for CSV/Excel export (YYYY-MM-DD)
 */
export const formatForExport = (dateStr) => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    } catch { return ""; }
};