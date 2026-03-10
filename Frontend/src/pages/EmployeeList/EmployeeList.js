// fileName: src/pages/EmployeeList/EmployeeList.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast";
import { candidateAPI } from "../../services/api"; 
import { 
  Users, Search, Eye, Trash2, Activity, Calendar, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Check, CheckCircle2 
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// --- Imported Components & Helpers ---
import { dashboardStyles, getStatusStyle } from "./EmployeeListStyles";
import { getValue, getUniqueKey, parseUniqueKey, formatDate } from "./EmployeeListUtils";
import { StatusDropdown, ExportDropdown, getStatusIcon } from "./EmployeeListComponents";
import EmployeeDetailsModal from "./EmployeeDetailsModal";

// --- SUB-COMPONENT: Custom Confirmation Modal ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, type = 'danger' }) => {
    if (!isOpen) return null;

    const colors = {
        danger: { bg: '#fee2e2', text: '#ef4444', btn: '#ef4444' },
        warning: { bg: '#ffedd5', text: '#f97316', btn: '#f97316' },
        success: { bg: '#dcfce7', text: '#16a34a', btn: '#16a34a' }
    };
    const theme = colors[type] || colors.danger;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease-out'
        }} onClick={onCancel}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '24px',
                width: '100%', maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: theme.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertTriangle size={20} color={theme.text} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                            {title}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                            {message}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                        onClick={onCancel}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                            backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                            backgroundColor: theme.btn, border: 'none', color: 'white', cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EmployeeList = () => {
  const navigate = useNavigate(); 
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [modalConfig, setModalConfig] = useState({
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      type: 'danger',
      onConfirm: () => {}
  });

  // --- 1. FETCH & FILTER DATA ---
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getCandidates();
      
      const processedData = data.map(emp => {
        // Fallback checks incase the DB hasn't been migrated fully yet
        const rawExportStatus = getValue(emp, 'exportStatus');
        const legacyExported = getValue(emp, 'isExported') === true || getValue(emp, 'IsExported') === true;
        
        let determinedExportStatus = "Pending";
        if (rawExportStatus && rawExportStatus !== "Pending") {
            determinedExportStatus = rawExportStatus;
        } else if (legacyExported) {
            determinedExportStatus = "Exported";
        }

        return {
          ...emp,
          candidateId: getValue(emp, 'candidateId'),
          companyId: getValue(emp, 'companyId'),
          fullName: getValue(emp, 'fullName'),
          status: getValue(emp, 'status') || "Pending",
          exportStatus: determinedExportStatus, 
          entryDate: getValue(emp, 'appliedDate') || getValue(emp, 'entryDate') || getValue(emp, 'createdAt'),
          oldIcNumber: getValue(emp, 'oldIcNumber'),
          newIcNumber: getValue(emp, 'newIcNumber'),
          passport: getValue(emp, 'passport'),
          gender: getValue(emp, 'gender'),
          salutation: getValue(emp, 'salutationDescription') || getValue(emp, 'salutationCode') || "-",
          positionCode: getValue(emp, 'positionCode'),
          positionName: getValue(emp, 'positionName') || "-"
        };
      });

      const userRole = localStorage.getItem('userRole'); 
      const userCompanyId = localStorage.getItem('companyId'); 

      let filteredData = processedData;
      if (userRole === 'admin' && userCompanyId) {
          filteredData = processedData.filter(emp => emp.companyId === userCompanyId);
      }
      
      setEmployees(filteredData);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch candidates");
      toast.error("Failed to load candidate list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchEmployees]);

  const getEntryDate = (emp) => emp.entryDate || emp.createdAt;
  const normalizedIncludes = (value = "", query = "") => String(value).toLowerCase().includes(String(query).toLowerCase());

  const getProcessedEmployees = () => {
    let result = employees.filter((emp) => {
      const fullName = emp.fullName || ""; 
      const matchesSearch = !searchQuery || (
        normalizedIncludes(fullName, searchQuery) ||
        normalizedIncludes(emp.candidateId, searchQuery) ||
        normalizedIncludes(emp.oldIcNumber, searchQuery) ||
        normalizedIncludes(emp.newIcNumber, searchQuery) ||
        normalizedIncludes(emp.passport, searchQuery) ||
        normalizedIncludes(emp.salutation, searchQuery) ||
        normalizedIncludes(emp.gender, searchQuery) ||
        normalizedIncludes(emp.positionName, searchQuery)
      );
      const matchesStatus = statusFilter === "All Status" || String(emp.status).toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";
        
        if (sortConfig.key === 'entryDate') {
          aValue = new Date(getEntryDate(a) || 0).getTime();
          bValue = new Date(getEntryDate(b) || 0).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  };

  const filteredEmployees = getProcessedEmployees();
  
  const statusCounts = {
      "All Status": employees.length,
      "Pending": 0,
      "Interview": 0,
      "Shortlisted": 0,
      "Accepted": 0,
      "Rejected": 0,
      "KIV": 0
  };

  employees.forEach(emp => {
      const s = String(emp.status).toLowerCase();
      if (s === 'interview') statusCounts["Interview"]++;
      else if (s === 'shortlisted') statusCounts["Shortlisted"]++;
      else if (s === 'accepted') statusCounts["Accepted"]++;
      else if (s === 'rejected') statusCounts["Rejected"]++;
      else if (s === 'kiv') statusCounts["KIV"]++;
      else statusCounts["Pending"]++; 
  });

  const pendingCount = statusCounts["Pending"];
  const thisMonthCount = employees.filter(e => {
    const d = new Date(getEntryDate(e));
    const now = new Date();
    return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const markCandidatesAsExported = async (keysToUpdate) => {
    if (!keysToUpdate || keysToUpdate.length === 0) return;
    const token = localStorage.getItem("authToken");

    try {
      const updatePromises = keysToUpdate.map(async (key) => {
        const { candidateId, companyId, positionCode } = parseUniqueKey(key);
        const pCode = positionCode || 'NULL';
        
        const url = `/api/companies/${encodeURIComponent(companyId)}/applications/${candidateId}/${encodeURIComponent(pCode)}/export-status`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exportStatus: "Exported" })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }
        return true;
      });
      
      await Promise.all(updatePromises);

      setEmployees(prev => prev.map(emp => 
        keysToUpdate.includes(getUniqueKey(emp))
        ? { ...emp, exportStatus: "Exported" } 
        : emp
      ));

      toast.success("Candidates successfully marked as Exported in the database.");
    } catch (error) {
      console.error("Failed to flag status as exported to DB:", error);
      toast.error(`Database update failed: ${error.message}`, { duration: 6000 });
    }
  };

  const handleDownloadResume = async (e, candidateId, companyId) => {
    if (e) e.stopPropagation(); 
    const token = localStorage.getItem("authToken");
    if (!token) { toast.error("You must be logged in to download resumes."); return; }
    const toastId = toast.loading("Checking for resume...");
    try {
        const endpoint = `/api/companies/${encodeURIComponent(companyId)}/HobbyLanguage/resume/${candidateId}`;
        const response = await fetch(endpoint, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 404) throw new Error("Resume file not found.");
            if (response.status === 401) throw new Error("Unauthorized. Please login.");
            throw new Error("Failed to download resume.");
        }
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `Resume_${candidateId}.pdf`;
        if (contentDisposition && contentDisposition.includes('filename=')) {
            fileName = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Resume downloading...", { id: toastId });
    } catch (err) {
        console.error("Download error:", err);
        toast.error(err.message || "Error downloading file", { id: toastId });
    }
  };

  const handlePreviewResume = async (e, candidateId, companyId) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) { toast.error("You must be logged in to view resumes."); return; }
    const toastId = toast.loading("Opening resume preview...");
    try {
        const endpoint = `/api/companies/${encodeURIComponent(companyId)}/HobbyLanguage/resume/${candidateId}`;
        const response = await fetch(endpoint, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("Resume file not found.");
            if (response.status === 401) throw new Error("Unauthorized. Please login.");
            throw new Error("Failed to open resume.");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.dismiss(toastId);
    } catch (err) {
        console.error("Preview error:", err);
        toast.error(err.message || "Error opening preview", { id: toastId });
    }
  };

  // --- HR ADAPTER EXPORT LOGIC ---
  const handleExportHRData = async () => {
      if (selectedKeys.size === 0) { toast.error("Please select at least one candidate to export."); return; }
      const toastId = toast.loading("Preparing HR Data Export...");

      try {
          const token = localStorage.getItem("authToken");
          const candidatesToExport = employees.filter(emp => selectedKeys.has(getUniqueKey(emp)));
          
          const unacceptedCandidates = candidatesToExport.filter(emp => String(emp.status).toLowerCase() !== 'accepted');
          
          if (unacceptedCandidates.length > 0) {
              toast.error(
                  `Export Blocked: You can only export candidates with 'Accepted' status. Please update the status for ${unacceptedCandidates.length} selected candidate(s) to 'Accepted' first.`, 
                  { id: toastId, duration: 6000 }
              );
              setIsExportDropdownOpen(false);
              return; 
          }

          let allRows = [];
          let errorMessages = [];
          let successfulKeys = [];

          const schemaKeys = [
              "BPOEFDT", "PERSONID", "NAME", "FIRSTNAME", "MIDDLENAME", "LASTNAME", "ALIAS", "SECGRPID", "RECLEVEL", "YRSVDT", "GRPJOINDT", "IC", "NEWIC", "SEX", "RACECODE", "RELIGNCODE", "NATIONCODE", "MARSTACODE", "CORRADDR", "CORRTELNO", "PERMADDR", "PERMTELNO", "EMAILADDR", "PASSPORTNO", "CTYORGCODE", "DATEBIRTH", "BIRTHMONTH",
              "USERFLD01", "USERFLD02", "USERFLD03", "USERFLD04", "USERFLD05", "USERFLD06", "USERFLD07", "USERFLD08", "USERFLD09", "USERFLD10",
              "ISNATIVE", "RETIREDT", "SALUTATION", "PHYDEFECTS", "EMCYNAME", "EMCYADDR", "EMCYTELNO", "OFFTELNO", "HPTELNO", "OTHTELNO", "PERMARRYDT", "PERHEIGHT", "PERWEIGHT", "COMPNYCODE", "DUECONFIRM1", "DUECONFIRM2", "CONFIRMDT", "CONTRACTDUE", "VISAEXPIRY", "PERMITDUE", "EPFICIND", "STFEPFFIXDEDT", "COEPFFIXDEDT", "SOCCATCODE", "PCBCATCODE", "COEPFREFCODE", "COSOCSOREFCODE", "COTAXREFCODE", "COPAYTAX", "EPFINITIAL", "GLSEG1CODE", "GLSEG2CODE", "PERMITNO", "PAYMODE", "COMMODE", "VECODE", "EPFCODE", "ISHEADCNT", "PESNCODE", "PAYGRPCODE",
              "EMPUSERFLD01", "EMPUSERFLD02", "EMPUSERFLD03", "EMPUSERFLD04", "EMPUSERFLD05", "EMPUSERFLD06", "EMPUSERFLD07", "EMPUSERFLD08", "EMPUSERFLD09", "EMPUSERFLD10",
              "PROBMTH", "HIREPOSTYPE", "NPAGMTYPCODE", "NPAGMMBRCODE", "JOBCODE", "GRADECODE", "EMPTYPCODE", "DIVSNCODE", "BRHLOCCODE", "DEPTCODE", "SECTIOCODE", "UNITCODE", "BASICAMT", "STAFFNO",
              "EMPUSERFLD11", "EMPUSERFLD12", "EMPUSERFLD13", "EMPUSERFLD14", "EMPUSERFLD15", "EMPUSERFLD16", "EMPUSERFLD17", "EMPUSERFLD18", "EMPUSERFLD19", "EMPUSERFLD20", "EMPUSERFLD21", "EMPUSERFLD22", "EMPUSERFLD23", "EMPUSERFLD24", "EMPUSERFLD25", "EMPUSERFLD26", "EMPUSERFLD27", "EMPUSERFLD28", "EMPUSERFLD29", "EMPUSERFLD30"
          ];

          const requiredFields = [
              'BPOEFDT', 'PERSONID', 'NAME', 'SECGRPID', 'RECLEVEL', 'YRSVDT', 'GRPJOINDT', 
              'SEX', 'RACECODE', 'RELIGNCODE', 'NATIONCODE', 'MARSTACODE', 'CORRADDR', 'PERMADDR', 
              'CTYORGCODE', 'BIRTHMONTH', 'ISNATIVE', 'COMPNYCODE', 'EPFICIND', 'STFEPFFIXDEDT', 
              'COEPFFIXDEDT', 'SOCCATCODE', 'PCBCATCODE', 'COPAYTAX', 'PAYMODE', 'COMMODE', 
              'ISHEADCNT', 'PAYGRPCODE', 'PROBMTH', 'HIREPOSTYPE', 'JOBCODE', 'GRADECODE', 
              'EMPTYPCODE', 'DIVSNCODE', 'BRHLOCCODE', 'DEPTCODE', 'SECTIOCODE', 'UNITCODE', 'BASICAMT'
          ];

          const dateFields = [
              'BPOEFDT', 'YRSVDT', 'GRPJOINDT', 'DATEBIRTH', 'PERMARRYDT', 
              'DUECONFIRM1', 'DUECONFIRM2', 'CONFIRMDT', 'CONTRACTDUE', 
              'VISAEXPIRY', 'PERMITDUE', 'RETIREDT'
          ];

          const formatExportDate = (dateStr) => {
              if (!dateStr) return "";
              const parts = String(dateStr).split('-');
              if (parts.length === 3) {
                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
              return dateStr;
          };

          for (const emp of candidatesToExport) {
              const hrRes = await fetch(`/api/companies/${encodeURIComponent(emp.companyId)}/HrAdapter/${emp.candidateId}`, {
                  headers: { "Authorization": `Bearer ${token}` }
              });

              let savedData = {};
              if (hrRes.ok) {
                  const hrData = await hrRes.json();
                  if (hrData && hrData.formDataJson) {
                      savedData = JSON.parse(hrData.formDataJson);
                  }
              }

              if (Object.keys(savedData).length === 0) {
                  errorMessages.push(`${emp.fullName}: No HR Adapter form saved.`);
                  continue;
              }

              let currentStaffNo = savedData.STAFFNO?.trim() || savedData.PERSONID?.trim();
              if (!currentStaffNo) {
                  errorMessages.push(`${emp.fullName}: Missing Staff No / Person ID.`);
                  continue;
              }
              savedData.STAFFNO = currentStaffNo;

              const checkUrl = `/api/companies/${encodeURIComponent(emp.companyId)}/employees/check-staffno/${encodeURIComponent(currentStaffNo)}`;
              const checkRes = await fetch(checkUrl, { headers: { "Authorization": `Bearer ${token}` } });

              if (checkRes.ok) {
                  const data = await checkRes.json();
                  if (data === true || data.exists || data.isDuplicate) {
                      errorMessages.push(`${emp.fullName}: Staff ID '${currentStaffNo}' already exists.`);
                      continue;
                  }
              } else if (checkRes.status === 409) {
                  errorMessages.push(`${emp.fullName}: Staff ID '${currentStaffNo}' already exists.`);
                  continue;
              }

              let missingField = false;
              requiredFields.forEach(field => {
                  if (savedData[field] === "" || savedData[field] === null || savedData[field] === undefined) {
                      missingField = true;
                  }
              });

              if (missingField) {
                  errorMessages.push(`${emp.fullName}: Missing required HR form fields.`);
                  continue;
              }

              const values = schemaKeys.map(key => {
                  let val = savedData[key];
                  if (val === null || val === undefined) val = "";
                  if (dateFields.includes(key) && val) {
                      val = formatExportDate(val);
                  }
                  const strVal = String(val);
                  if (strVal.includes(",") || strVal.includes("\"")) {
                      return `"${strVal.replace(/"/g, '""')}"`;
                  }
                  return strVal;
              });

              allRows.push(values.join(","));
              successfulKeys.push(getUniqueKey(emp));
          }

          if (allRows.length === 0) {
              toast.error("Export aborted. No valid candidates ready for export.\n\n" + errorMessages.join('\n'), { id: toastId, duration: 8000 });
              return;
          }

          if (errorMessages.length > 0) {
              toast.error(`Exported ${allRows.length}, but some were skipped:\n${errorMessages.join('\n')}`, { duration: 6000 });
          }

          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const fileNameStamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
          const fileName = `${fileNameStamp}_BPONEWJOIN.KZULF`;

          const csvContent = allRows.join("\n");
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`HR Data Exported Successfully for ${allRows.length} candidates!`, { id: toastId });
          
          await markCandidatesAsExported(successfulKeys);
          setSelectedKeys(new Set());
          setIsExportDropdownOpen(false);

      } catch (error) {
          console.error("Export error:", error);
          toast.error("An error occurred while exporting the HR data.", { id: toastId });
      }
  };

  // --- DETAILED PDF EXPORT LOGIC ---
  const handleExportPDF = async () => {
    if (selectedKeys.size === 0) { 
        toast.error("Please select at least one candidate to export."); 
        return; 
    }
    
    const candidatesToExport = employees.filter(emp => selectedKeys.has(getUniqueKey(emp)));
    const toastId = toast.loading("Fetching full candidate data for PDF export...");

    try {
        const companyId = localStorage.getItem('companyId') || candidatesToExport[0].companyId;
        const token = localStorage.getItem('authToken');
        const tenantPath = `/api/companies/${encodeURIComponent(companyId)}`;

        // 1. Fetch Dictionaries (Once)
        const fetchOptionsMap = async (tableName) => {
            try {
                const res = await fetch(`${tenantPath}/AdminUpdate/options/${tableName}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (!res.ok) return {};
                const data = await res.json();
                const map = {};
                data.forEach(item => {
                    const code = item.code || item.Code;
                    const desc = item.description || item.Description || item.name || item.Name;
                    if (code) map[code] = desc;
                });
                return map;
            } catch { 
                return {}; 
            }
        };

        const [
            salutations, maritalStatuses, races, religions, nationalities, countries,
            industries, jobTitles, cessations, hobbyMap, langMap, fieldAreaMap, qualMap, gradeMap
        ] = await Promise.all([
            fetchOptionsMap('salutation_code'), fetchOptionsMap('marital_status_codes'), fetchOptionsMap('race_codes'),
            fetchOptionsMap('religion_codes'), fetchOptionsMap('nationality_codes'), fetchOptionsMap('country_origin_codes'),
            fetchOptionsMap('industry_codes'), fetchOptionsMap('job_codes'), fetchOptionsMap('cessation_reasons'),
            fetchOptionsMap('hobby_codes'), fetchOptionsMap('language_codes'), fetchOptionsMap('field_area_codes'),
            fetchOptionsMap('qualification_codes'), fetchOptionsMap('qualification_grades')
        ]);

        const doc = new jsPDF({ orientation: "portrait" });
        doc.setFontSize(18); doc.text("Candidate Profiles Export", 14, 20);
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);
        let finalY = 35;

        for (let i = 0; i < candidatesToExport.length; i++) {
            const empBase = candidatesToExport[i];
            const candidateId = empBase.candidateId;

            // 2. Fetch Individual Data
            const safeFetch = async (controller) => {
                try {
                    const res = await fetch(`${tenantPath}/${controller}/${candidateId}`, { 
                        headers: { 'Authorization': `Bearer ${token}` } 
                    });
                    if (!res.ok) return null;
                    return await res.json();
                } catch { return null; }
            };

            const safeFetchList = async (controller) => {
                const res = await safeFetch(controller);
                return Array.isArray(res) ? res : [];
            };

            const [rawBasic, contact, quals, jobs, skills, hobbyLangData, fieldExps] = await Promise.all([
                safeFetch('candidates'),
                safeFetch('contact'),
                safeFetchList('Qualification'),
                safeFetchList('EmploymentHistory'),
                safeFetch('Skill'),
                safeFetch('HobbyLanguage'),
                safeFetchList('FieldExperience')
            ]);

            const basic = rawBasic && (rawBasic.profile || rawBasic.Profile) ? (rawBasic.profile || rawBasic.Profile) : (rawBasic || empBase);

            // Safe fetcher inside loops that properly evaluates empty strings/null
            const safeGetValue = (obj, key) => {
                if (!obj) return '';
                if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (obj[pascalKey] !== undefined && obj[pascalKey] !== null && obj[pascalKey] !== '') return obj[pascalKey];
                return '';
            };

            const getMappedName = (obj, codeKeys, descKey, map) => {
                let code = '';
                if (Array.isArray(codeKeys)) {
                    for (let k of codeKeys) {
                        code = safeGetValue(obj, k);
                        if (code) break;
                    }
                } else {
                    code = safeGetValue(obj, codeKeys);
                }
                const desc = safeGetValue(obj, descKey);
                if (code && map[code]) return map[code];
                if (desc) return desc;
                return code || '-';
            };

            // Map Data
            const REC_TYPE_MAP = {
                'EMPLOYEE': 'Employee Referral', 'COLLEGE': 'College / University',
                'AGENCY': 'Agency', 'ADVERTISEMENT': 'Advertisement', 'OTHERS': 'Others'
            };

            // --- Formatting the PDF ---
            if (finalY > 240 && i > 0) { doc.addPage(); finalY = 20; }
            
            const fullName = safeGetValue(basic, 'fullName') || empBase.fullName;
            const salutation = getMappedName(basic, 'salutationCode', 'salutationDescription', salutations) || empBase.salutation;
            const positionName = safeGetValue(basic, 'positionName') || empBase.positionName;
            const positionCode = safeGetValue(basic, 'positionCode') || empBase.positionCode;

            doc.setFontSize(14); doc.setTextColor(37, 99, 235); doc.setFont(undefined, 'bold');
            doc.text(`${salutation !== '-' ? salutation + ' ' : ''}${fullName}`, 14, finalY);
            doc.setFontSize(10); doc.setTextColor(107, 114, 128); doc.setFont(undefined, 'normal');
            doc.text(`Position: ${positionName} (${positionCode})`, 14, finalY + 6);
            doc.text(`ID: ${candidateId}  |  Company: ${empBase.companyId}  |  Status: ${empBase.status}`, 14, finalY + 11);

            let bodyData = [
                [{ content: 'Basic Information', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }],
                ['Gender', safeGetValue(basic, 'genderDescription') || safeGetValue(basic, 'gender') || '-'],
                ['Birth Date', formatDate(safeGetValue(basic, 'birthDate')) || '-'],
                ['Marital Status', getMappedName(basic, 'maritalStatusCode', 'maritalStatusDescription', maritalStatuses)],
                ['Race', getMappedName(basic, 'raceCode', 'raceDescription', races)],
                ['Religion', getMappedName(basic, 'religionCode', 'religionDescription', religions)],
                ['Nationality', getMappedName(basic, 'nationalityCode', 'nationalityDescription', nationalities)],
                ['Country of Origin', getMappedName(basic, 'countryOfOriginCode', 'countryOfOriginDescription', countries)],
                ['Native Status', safeGetValue(basic, 'nativeStatus') || '-'],
                ['Recommendation', REC_TYPE_MAP[safeGetValue(basic, 'recommendationType')] || safeGetValue(basic, 'recommendationType') || '-'],
                ['Disability', safeGetValue(basic, 'disability') || '-'],

                [{ content: 'Contact Information', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }],
                ['Email', safeGetValue(contact, 'email') || '-'],
                ['Personal Phone', safeGetValue(contact, 'phoneNumber') || '-'],
                ['Office Phone', safeGetValue(contact, 'officeNumber') || '-'],
                ['Correspondence Address', safeGetValue(contact, 'correspondenceAddress') || '-'],
                ['Permanent Address', safeGetValue(contact, 'permanentAddress') || '-'],
                ['Emergency Contact', `${safeGetValue(contact, 'emergencyContactName') || '-'} (${safeGetValue(contact, 'emergencyPhone') || '-'})`]
            ];

            // Qualifications
            if (quals && quals.length > 0) {
                bodyData.push([{ content: 'Qualifications', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }]);
                quals.forEach((q, idx) => {
                    bodyData.push([`Qual #${idx+1} ${safeGetValue(q, 'isHighest') ? '(Highest)' : ''}`, 
                        `${getMappedName(q, 'qualificationCode', 'qualificationName', qualMap)} in ${safeGetValue(q, 'qualificationSubName') || safeGetValue(q, 'qualificationSubCode') || '-'}\n` +
                        `${safeGetValue(q, 'schoolName') || '-'} | CGPA/Grade: ${safeGetValue(q, 'cgpa') || getMappedName(q, 'qualificationGradeCode', 'qualificationGradeName', gradeMap) || '-'}\n` +
                        `Completed: ${formatDate(safeGetValue(q, 'sinceWhenDate'))}`
                    ]);
                });
            }

            // Employment History
            if (jobs && jobs.length > 0) {
                bodyData.push([{ content: 'Employment History', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }]);
                jobs.forEach((j, idx) => {
                    bodyData.push([`Job #${idx+1} ${safeGetValue(j, 'latest') ? '(Latest)' : ''}`, 
                        `${getMappedName(j, 'jobCode', 'jobName', jobTitles)} at ${safeGetValue(j, 'employerName') || '-'}\n` +
                        `${formatDate(safeGetValue(j, 'fromDate'))} to ${safeGetValue(j, 'toDate') ? formatDate(safeGetValue(j, 'toDate')) : 'Present'}\n` +
                        `Industry: ${getMappedName(j, 'industryCode', 'industryName', industries)}\n` +
                        `Reason for leaving: ${getMappedName(j, ['cessationReasonCode', 'cessationReason'], 'cessationReasonDescription', cessations)}`
                    ]);
                });
            }

            // Skills & Field Experience
            bodyData.push([{ content: 'Skills & Experience', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }]);
            if (skills && Object.keys(skills).length > 0) {
                bodyData.push(['Office Skills', safeGetValue(skills, 'officeSkill') || safeGetValue(skills, 'officeSkills') || '-']);
                bodyData.push(['Other Skills', safeGetValue(skills, 'otherSkill') || safeGetValue(skills, 'otherRelevantSkills') || '-']);
            }
            if (fieldExps && fieldExps.length > 0) {
                const exps = fieldExps.map(f => `${getMappedName(f, 'fieldAreaCode', 'fieldName', fieldAreaMap)} (${safeGetValue(f, 'yearsOfExperience') || safeGetValue(f, 'yearInField')} yrs)`).join(', ');
                bodyData.push(['Field Experience', exps]);
            }

            // Hobbies & Languages
            const hobbies = safeGetValue(hobbyLangData, 'hobbies') || [];
            const languages = safeGetValue(hobbyLangData, 'languages') || [];
            
            if (hobbies.length > 0 || languages.length > 0) {
                bodyData.push([{ content: 'Hobbies & Languages', colSpan: 2, styles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [17, 24, 39] } }]);
                if (languages.length > 0) {
                    const langs = languages.map(l => `${getMappedName(l, 'languageCode', 'languageName', langMap)} (R:${safeGetValue(l, 'readLevel')} W:${safeGetValue(l, 'writtenLevel')} S:${safeGetValue(l, 'spokenLevel')})`).join('\n');
                    bodyData.push(['Languages', langs]);
                }
                if (hobbies.length > 0) {
                    const hobs = hobbies.map(h => `${getMappedName(h, 'hobbyCode', 'hobbyName', hobbyMap)} (${safeGetValue(h, 'abilityLevel')})`).join(', ');
                    bodyData.push(['Hobbies', hobs]);
                }
            }

            autoTable(doc, { 
                startY: finalY + 16, 
                body: bodyData, 
                theme: 'grid', 
                styles: { fontSize: 9, cellPadding: 4, lineColor: [229, 231, 235] }, 
                columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold', textColor: [75, 85, 99], fillColor: [255, 255, 255] }, 1: { cellWidth: 'auto', textColor: [31, 41, 55] } }, 
                margin: { left: 14, right: 14 } 
            });
            
            finalY = doc.lastAutoTable.finalY + 20; 
        }

        doc.save(`candidates_profiles_${new Date().toISOString().slice(0,10)}.pdf`);
        setIsExportDropdownOpen(false);
        toast.success(`Successfully exported ${candidatesToExport.length} detailed profiles to PDF!`, { id: toastId });
        
        setSelectedKeys(new Set()); 

    } catch (err) {
        console.error("PDF Export Error: ", err);
        toast.error("Failed to fetch all data for PDF export.", { id: toastId });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allKeys = filteredEmployees.map(emp => getUniqueKey(emp));
      setSelectedKeys(new Set(allKeys));
    } else {
      setSelectedKeys(new Set());
    }
  };

  const handleSelectOne = (key) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedKeys(newSelected);
  };

  const initiateDelete = (candidateId, name, companyId, positionCode) => {
    setModalConfig({
        isOpen: true, title: 'Delete Candidate?',
        message: `Are you sure you want to delete ${name}? This will remove their application for position ${positionCode || 'Unknown'}.`,
        confirmText: 'Delete', type: 'danger', onConfirm: () => performDelete(candidateId, name, companyId, positionCode)
    });
  };

  const performDelete = async (candidateId, name, companyId, positionCode) => {
      setModalConfig(prev => ({ ...prev, isOpen: false })); 
      try {
        await candidateAPI.deleteCandidate(candidateId, companyId, positionCode);
        setEmployees(employees.filter((emp) => getUniqueKey(emp) !== `${candidateId}|${companyId}|${positionCode || 'NULL'}`));
        toast.success("Candidate deleted successfully");
        if (selectedEmployee?.candidateId === candidateId && selectedEmployee?.companyId === companyId && selectedEmployee?.positionCode === positionCode) {
             setIsModalOpen(false);
        }
      } catch (err) {
        toast.error("Failed to delete candidate");
      }
  };

  const handleSingleStatusUpdate = async (newStatus) => {
    if (!selectedEmployee) return;
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
        await candidateAPI.updateStatus(selectedEmployee.candidateId, newStatus, selectedEmployee.companyId, selectedEmployee.positionCode);
        setEmployees(prev => prev.map(emp => 
            (emp.candidateId === selectedEmployee.candidateId && emp.companyId === selectedEmployee.companyId && emp.positionCode === selectedEmployee.positionCode)
            ? { ...emp, status: newStatus } 
            : emp
        ));
        setSelectedEmployee(prev => ({ ...prev, status: newStatus }));
        toast.success("Status updated!", { id: loadingToast });
    } catch (err) {
        console.error("Failed to update status", err);
        toast.error("Failed to update status", { id: loadingToast });
    }
  };

  const initiateBulkDelete = () => {
    setModalConfig({
        isOpen: true, title: 'Delete Selected Candidates?',
        message: `Are you sure you want to delete ${selectedKeys.size} selected candidates? This action cannot be undone.`,
        confirmText: `Delete ${selectedKeys.size} Candidates`, type: 'danger', onConfirm: () => performBulkDelete()
    });
  };

  const performBulkDelete = async () => {
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      try {
          const deletePromises = Array.from(selectedKeys).map(key => {
             const { candidateId, companyId, positionCode } = parseUniqueKey(key);
             return candidateAPI.deleteCandidate(candidateId, companyId, positionCode);
          });
          await Promise.all(deletePromises);
          toast.success(`Deleted ${selectedKeys.size} candidates`);
          setEmployees(employees.filter(e => !selectedKeys.has(getUniqueKey(e))));
          setSelectedKeys(new Set());
      } catch (error) {
          toast.error("Failed to delete some candidates");
      }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedKeys.size === 0) return;
    if (actionType === 'delete') { initiateBulkDelete(); } 
    else {
      const newStatus = actionType === 'accept' ? 'Accepted' : 
                        actionType === 'reject' ? 'Rejected' : 
                        actionType === 'shortlisted' ? 'Shortlisted' : 
                        actionType === 'interview' ? 'Interview' : 'KIV';
      const toastId = toast.loading("Updating statuses...");
      try {
        const updatePromises = Array.from(selectedKeys).map(key => {
           const { candidateId, companyId, positionCode } = parseUniqueKey(key);
           return candidateAPI.updateStatus(candidateId, newStatus, companyId, positionCode);
        });
        await Promise.all(updatePromises);
        setEmployees(employees.map(emp => 
          selectedKeys.has(getUniqueKey(emp)) ? { ...emp, status: newStatus } : emp
        ));
        toast.success(`Updated ${selectedKeys.size} candidates to ${newStatus}`, { id: toastId });
        setSelectedKeys(new Set());
      } catch (error) {
        console.error("Bulk Update Error:", error);
        toast.error("Failed to update status.", { id: toastId });
      }
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleNavigateToHrAdapter = (employee) => {
    navigate(`/hr-adapter/${encodeURIComponent(employee.companyId)}/${employee.candidateId}`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;

  return (
    <div style={dashboardStyles.container}> 
      
      <div style={dashboardStyles.header}>
        <div>
          <h2 style={dashboardStyles.title}>Candidate Directory</h2>
          <p style={dashboardStyles.subtitle}>Manage your recruitment pipeline efficiently.</p>
        </div>
      </div>

      <div style={dashboardStyles.statsGrid}>
        <div style={dashboardStyles.statCard}><div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>Total Candidates</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{employees.length}</h2></div><div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#eff6ff" }}><Users size={24} color="#3b82f6" /></div></div>
        <div style={dashboardStyles.statCard}><div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>Pending Review</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{pendingCount}</h2></div><div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#fff7ed" }}><Activity size={24} color="#f97316" /></div></div>
        <div style={dashboardStyles.statCard}><div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>This Month</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{thisMonthCount}</h2></div><div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#f0fdf4" }}><Calendar size={24} color="#16a34a" /></div></div>
      </div>

      {selectedKeys.size > 0 && (
        <div style={dashboardStyles.bulkActionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontWeight: "700", fontSize: "15px", color: "#172554" }}>{selectedKeys.size} selected</span></div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => handleBulkAction('accept')} className="btn" style={{backgroundColor: "#dcfce7", color: "#166534", border: 'none', padding: '8px 16px', whiteSpace: 'nowrap'}}>Accept</button>
            <button onClick={() => handleBulkAction('shortlisted')} className="btn" style={{backgroundColor: "#f3e8ff", color: "#6b21a8", border: 'none', padding: '8px 16px', whiteSpace: 'nowrap'}}>Shortlist</button>
            <button onClick={() => handleBulkAction('interview')} className="btn" style={{backgroundColor: "#ccfbf1", color: "#0f766e", border: 'none', padding: '8px 16px', whiteSpace: 'nowrap'}}>Interview</button>
            <button onClick={() => handleBulkAction('reject')} className="btn" style={{backgroundColor: "#fee2e2", color: "#991b1b", border: 'none', padding: '8px 16px', whiteSpace: 'nowrap'}}>Reject</button>
            <button onClick={() => handleBulkAction('kiv')} className="btn" style={{backgroundColor: "#fef9c3", color: "#854d0e", border: 'none', padding: '8px 16px', whiteSpace: 'nowrap'}}>KIV</button>
            <div style={{ width: '1px', backgroundColor: '#93c5fd', margin: '0 4px', height: '24px', display: 'inline-block' }}></div>
            <button onClick={() => handleBulkAction('delete')} className="btn" style={{backgroundColor: "white", color: "#ef4444", border: "1px solid #fca5a5", whiteSpace: 'nowrap'}}>Delete</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "visible" }}> 
        <div className="card-header" style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px 24px", backgroundColor: "#6366f1", borderRadius: "12px 12px 0 0", color: "white" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}><h2 className="card-title" style={{ margin: 0, fontSize: "18px", color: "white", whiteSpace: "nowrap" }}>All Candidates</h2><span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', whiteSpace: "nowrap" }}>{filteredEmployees.length} records</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end", flexWrap: "nowrap" }}>
            <div style={{ position: "relative", width: "240px" }}><Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px" }} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input" style={{ paddingLeft: "38px", width: "100%", height: "40px", fontSize: "14px", backgroundColor: "white", border: "none", borderRadius: "8px", color: "#374151", boxSizing: "border-box" }} /></div>
            <div style={{ minWidth: "160px", height: "40px" }}><StatusDropdown statusFilter={statusFilter} setStatusFilter={setStatusFilter} isOpen={isStatusDropdownOpen} setIsOpen={setIsStatusDropdownOpen} dropdownRef={dropdownRef} statusCounts={statusCounts} /></div>
            <ExportDropdown onExportPDF={handleExportPDF} onExportHR={handleExportHRData} isOpen={isExportDropdownOpen} setIsOpen={setIsExportDropdownOpen} dropdownRef={exportDropdownRef} />
          </div>
        </div>

        {error ? ( <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}><p>{error}</p><button onClick={fetchEmployees} className="btn btn-primary" style={{marginTop: '10px'}}>Try Again</button></div>
        ) : filteredEmployees.length === 0 ? (
           <div style={{ padding: "64px", textAlign: "center", color: "#6b7280" }}><Users size={48} style={{ marginBottom: "16px", opacity: 0.2 }} /><h3 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151'}}>No candidates found</h3><p style={{margin: 0}}>Try adjusting your search filters.</p></div>
        ) : (
          <div style={dashboardStyles.tableContainer}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "14px", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{...dashboardStyles.th, width: '30px'}}><input type="checkbox" checked={filteredEmployees.length > 0 && selectedKeys.size === filteredEmployees.length} onChange={handleSelectAll} style={{ width: "18px", height: "18px", cursor: "pointer" }} /></th>
                  <th style={{...dashboardStyles.th, width: '80px'}} onClick={() => handleSort('candidateId')}>ID {getSortIcon('candidateId')}</th>
                  <th style={{...dashboardStyles.th, width: '60px'}} onClick={() => handleSort('companyId')}>Comp {getSortIcon('companyId')}</th>
                  <th style={{...dashboardStyles.th, width: '140px'}} onClick={() => handleSort('positionName')}>Position {getSortIcon('positionName')}</th>
                  <th style={{...dashboardStyles.th, width: '60px'}} onClick={() => handleSort('salutation')}>Salut. {getSortIcon('salutation')}</th>
                  <th style={{...dashboardStyles.th, width: 'auto'}} onClick={() => handleSort('fullName')}>Name {getSortIcon('fullName')}</th>
                  <th style={{...dashboardStyles.th, width: '60px'}} onClick={() => handleSort('gender')}>Gender {getSortIcon('gender')}</th>
                  <th style={{...dashboardStyles.th, width: '90px'}} onClick={() => handleSort('entryDate')}>Date {getSortIcon('entryDate')}</th>
                  <th style={{...dashboardStyles.th, width: '110px'}} onClick={() => handleSort('newIcNumber')}>IC No. {getSortIcon('newIcNumber')}</th>
                  {/* Expanded width slightly to fit stacked badges */}
                  <th style={{...dashboardStyles.th, width: '120px'}} onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                  <th style={{...dashboardStyles.th, width: '100px', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const uniqueKey = getUniqueKey(employee);
                  return (
                    <tr key={uniqueKey} style={{ backgroundColor: selectedKeys.has(uniqueKey) ? '#f8fafc' : 'transparent', transition: 'background 0.2s' }}>
                      <td style={dashboardStyles.td}><input type="checkbox" checked={selectedKeys.has(uniqueKey)} onChange={() => handleSelectOne(uniqueKey)} style={{ width: "18px", height: "18px", cursor: "pointer" }} /></td>
                      <td style={dashboardStyles.td}><span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{employee.candidateId}</span></td>
                      <td style={dashboardStyles.td}><span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{employee.companyId}</span></td>
                      
                      <td style={dashboardStyles.td} title={employee.positionName}>
                          <div style={{ fontWeight: '500', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.positionName}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>{employee.positionCode}</div>
                      </td>

                      <td style={dashboardStyles.td}>{employee.salutation}</td>
                      <td style={{ ...dashboardStyles.td, whiteSpace: "normal", overflowWrap: "break-word", wordBreak: "break-word" }} title={employee.fullName}>
                        <span style={{ fontWeight: '600', color: '#0f172a', lineHeight: '1.3' }}>{employee.fullName}</span>
                      </td>
                      <td style={dashboardStyles.td}>{employee.gender}</td>
                      <td style={dashboardStyles.td}>{formatDate(getEntryDate(employee))}</td>
                      <td style={dashboardStyles.td}>{employee.newIcNumber || employee.oldIcNumber || "-"}</td>
                      
                      <td style={dashboardStyles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          <span style={{...dashboardStyles.badge, ...getStatusStyle(employee.status)}}>
                            {getStatusIcon(employee.status)} {employee.status}
                          </span>
                          
                          {/* DYNAMIC EXPORT STATUS BADGES - WITH CASE-INSENSITIVE CHECK */}
                          {String(employee.exportStatus || "").toLowerCase() === "exported" && (
                            <span style={dashboardStyles.exportedBadge} title="HR Data Exported">
                              <Check size={10} /> Exported
                            </span>
                          )}
                          {String(employee.exportStatus || "").toLowerCase() === "profile updated" && (
                            <span style={dashboardStyles.profileUpdatedBadge} title="Profile Updated in HrAdapter">
                              <CheckCircle2 size={10} /> Profile Updated
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{...dashboardStyles.td, textAlign: 'right'}}>
                        <button onClick={() => handleView(employee)} style={{ ...dashboardStyles.actionBtn, color: '#4b5563', backgroundColor: '#f3f4f6' }} title="View Details"><Eye size={18} /></button>
                        <button onClick={() => initiateDelete(employee.candidateId, employee.fullName, employee.companyId, employee.positionCode)} style={{...dashboardStyles.actionBtn, color: '#ef4444', backgroundColor: '#fee2e2'}} title="Delete"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />

      <EmployeeDetailsModal 
          employee={selectedEmployee} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onDelete={initiateDelete} 
          onStatusUpdate={handleSingleStatusUpdate}
          onDownloadResume={handleDownloadResume} 
          onPreviewResume={handlePreviewResume} 
          getEntryDate={getEntryDate}
          onPrepareHrExport={handleNavigateToHrAdapter}
      />
    </div>
  );
};

export default EmployeeList;