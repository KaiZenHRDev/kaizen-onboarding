// fileName: src/pages/AdminUpdate.js
import React, { useState, useEffect, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Configuration defining forms and their fields
const FORM_FIELDS_CONFIG = {
  'Position Form': {
    fields: [
      { name: 'positionCode', label: 'Position Code' } 
    ]
  },
  'Personal Form': {
    fields: [
      { name: 'salutation', label: 'Salutation' },
      { name: 'maritalStatus', label: 'Marital Status' },
      { name: 'race', label: 'Race' },
      { name: 'religion', label: 'Religion' },
      { name: 'nationality', label: 'Nationality' },
      { name: 'countryOfOrigin', label: 'Country of Origin' },
    ]
  },
  'Qualification Form': {
    fields: [
      { name: 'qualificationCode', label: 'Qualification Code' },
      { name: 'qualificationGradeCode', label: 'Grade Code' }
    ]
  },
  'Employment History Form': {
    fields: [
      { name: 'industryCode', label: 'Industry Code' },
      { name: 'jobCode', label: 'Job Code' },
      { name: 'cessationReason', label: 'Cessation Reason' }
    ]
  },
  'Hobby & Language Form': {
    fields: [
      { name: 'hobbyCode', label: 'Hobby Code' },
      { name: 'languageCode', label: 'Language Code' }
    ]
  },
  'Field Experience Form': {
    fields: [
      { name: 'fieldAreaCode', label: 'Field Area Code' }
    ]
  },
  'HR Adapter Forms': {
    fields: [
      { name: 'payGroupCode', label: 'Pay Group Code' },
      { name: 'branchCode', label: 'Branch Code' },
      { name: 'companyCode', label: 'Company Code' },
      { name: 'departmentCode', label: 'Department Code' },
      { name: 'divisionCode', label: 'Division Code' },
      { name: 'emptyCode', label: 'Employment Type Code' },
      { name: 'epfCode', label: 'EPF Code' },
      { name: 'gl1Code', label: 'GL Accounting Code 1' },
      { name: 'gl2Code', label: 'GL Accounting Code 2' },
      { name: 'jobGradeCode', label: 'Job Grade Code' },
      { name: 'unitCode', label: 'Unit Code' },
      { name: 'veCode', label: 'VE Code' },
      { name: 'pcbCode', label: 'PCB Code' },
      { name: 'pensionCode', label: 'Pension Code' },
      { name: 'sectionCode', label: 'Section Code' },
      { name: 'securityCode', label: 'Security Code' },
      { name: 'socsoCode', label: 'SOCSO Code' },
      { name: 'statutoryCode', label: 'Statutory/Company SOCSO Ref Code' }
    ]
  }
};

const tableNameMap = {
    'salutation': 'salutation_code',
    'maritalStatus': 'marital_status_codes',
    'race': 'race_codes',
    'religion': 'religion_codes',
    'nationality': 'nationality_codes',
    'countryOfOrigin': 'country_origin_codes',
    'qualificationCode': 'qualification_codes', 
    'qualificationGradeCode': 'qualification_grades',
    'industryCode': 'industry_codes',
    'jobCode': 'job_codes',
    'positionCode': 'position_codes',
    'cessationReason': 'cessation_reasons',
    'hobbyCode': 'hobby_codes',
    'languageCode': 'language_codes',
    'fieldAreaCode': 'field_area_codes',

    // NEW MAPPINGS
    'payGroupCode': 'pay_group_code',
    'branchCode': 'branch_code',
    'companyCode': 'company_code',
    'departmentCode': 'department_code',
    'divisionCode': 'division_code',
    'emptyCode': 'empty_code',
    'epfCode': 'epf_code',
    'gl1Code': 'gl1_code',
    'gl2Code': 'gl2_code',
    'jobGradeCode': 'job_grade_code',
    'unitCode': 'unit_code',
    'veCode': 've_code',
    'pcbCode': 'pcb_code',
    'pensionCode': 'pension_code',
    'sectionCode': 'section_code',
    'securityCode': 'security_code',
    'socsoCode': 'socso_code',
    'statutoryCode': 'statutory_code'
};

// Expected headers based on CsvHelper ClassMaps in the backend
const EXPECTED_HEADERS = {
    'salutation': "'salucode', 'saludesc'",
    'maritalStatus': "'marstacode', 'marstaname'",
    'race': "'racecode', 'racename'",
    'religion': "'religncode', 'relignname'",
    'nationality': "'nationcode', 'nationame'",
    'countryOfOrigin': "'ctyorgcode', 'ctyorgname'",
    'qualificationCode': "'qlfcatid', 'qlfcatname', 'qlfsubid', 'qlfsubname'", 
    'qualificationGradeCode': "'qlfgradecode', 'qlfgradename', 'qlfgraderank'",
    'industryCode': "'indstrycode', 'indstryname'",
    'jobCode': "'jobcode', 'jobpost'",
    'positionCode': "'code' (or 'jobcode'), 'name' (or 'jobpost', 'position')",
    'cessationReason': "'rsgnrsncode', 'rsgnrsndesc'",
    'hobbyCode': "'hbycode', 'hbyname'",
    'languageCode': "'langcode', 'langname'",
    'fieldAreaCode': "'fldareaid', 'fldareaname'",
    'payGroupCode': "'paygrpcode', 'descrip'",
    'branchCode': "'brhloccode', 'brhlocname'",
    'companyCode': "'compnycode', 'compnyname'",
    'departmentCode': "'departcode', 'departname'",
    'divisionCode': "'divisncode', 'divisnname'",
    'emptyCode': "'emptypcode', 'emptypname'",
    'epfCode': "'epfcode', 'descrip'",
    'gl1Code': "'glseg1code', 'glseg1name'",
    'gl2Code': "'glseg2code', 'glseg2name'",
    'jobGradeCode': "'gradecode', 'gradename'",
    'unitCode': "'unitcode', 'unitname'",
    'veCode': "'vecode'",
    'pcbCode': "'pcbtabcode', 'pcbtabdesc'",
    'pensionCode': "'pesncode'",
    'sectionCode': "'sectiocode', 'sectioname'",
    'securityCode': "'grpid', 'grpname'",
    'socsoCode': "'soctabcode', 'soctabdesc'",
    'statutoryCode': "'rid_stfcorefcode', 'compnycode'"
};

const AdminUpdate = () => {
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loadingStatus && Object.keys(uploadStatus).length > 0) {
      localStorage.setItem('dropdownUploadStatus', JSON.stringify(uploadStatus));
    }
  }, [uploadStatus, loadingStatus]);

  const refreshUploadStatus = useCallback(async (uploadedFileName = null, statusKeyForUpdate = null) => {
    if (refreshing && !loadingStatus) return;

    setRefreshing(true);
    const companyId = localStorage.getItem('companyId');
    const token = localStorage.getItem('authToken');
    const toastId = loadingStatus ? null : 'refreshToast';
    
    if (toastId) toast.loading('Checking database status...', { id: toastId });

    if (!companyId) {
        setRefreshing(false);
        setLoadingStatus(false);
        return;
    }

    const statusPromises = [];
    let totalFieldsCount = 0;

    for (const formName in FORM_FIELDS_CONFIG) {
      for (const field of FORM_FIELDS_CONFIG[formName].fields) {
        totalFieldsCount++;
        const statusKey = `${formName}|${field.name}`;
        const tableName = tableNameMap[field.name];

        if (!tableName) continue;

        const url = `/api/companies/${encodeURIComponent(companyId)}/AdminUpdate/status/${tableName}`;

        statusPromises.push(
            fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(metadata => {
                return {
                    key: statusKey,
                    isUpdated: metadata.hasData && metadata.lastUpdated, 
                    data: { uploaded: metadata.hasData, timestamp: metadata.lastUpdated }
                };
            })
            .catch(() => ({ key: statusKey, isUpdated: false, data: { uploaded: false } }))
        );
      }
    }

    const results = await Promise.allSettled(statusPromises);
    let fieldsWithDataCount = 0;

    setUploadStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                const { key, isUpdated, data } = result.value;
                
                let finalFileName = 'DB Verified';
                if (key === statusKeyForUpdate && uploadedFileName) {
                    finalFileName = uploadedFileName;
                } else if (prevStatus[key]?.fileName && prevStatus[key].fileName !== 'DB Verified') {
                     finalFileName = prevStatus[key].fileName;
                }

                if (isUpdated) {
                    fieldsWithDataCount++;
                    newStatus[key] = { ...data, fileName: finalFileName };
                } else {
                    newStatus[key] = { uploaded: false };
                }
            }
        });
        
        if (toastId) {
            const message = fieldsWithDataCount > 0
                ? `Refresh complete. Found data for ${fieldsWithDataCount} / ${totalFieldsCount} fields.`
                : `Refresh complete. No data found.`;
            toast.success(message, { id: toastId, duration: 3000 });
        }
        
        return newStatus;
    });

    setRefreshing(false);
    setLoadingStatus(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    const savedStatus = localStorage.getItem('dropdownUploadStatus');
    if (savedStatus) {
      try { setUploadStatus(JSON.parse(savedStatus)); } catch (e) { }
    }
    refreshUploadStatus();
  }, [refreshUploadStatus]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedForm || !selectedField) return;

    const field = FORM_FIELDS_CONFIG[selectedForm]?.fields.find(f => f.name === selectedField);
    const companyId = localStorage.getItem('companyId');
    const token = localStorage.getItem('authToken');
    const tableName = tableNameMap[field.name];
    const requiredHeadersText = EXPECTED_HEADERS[field.name] || "'code', 'name'";

    const targetUrl = `/api/companies/${encodeURIComponent(companyId)}/AdminUpdate/upload/${tableName}`;
    const toastId = `upload-${tableName}`;
    
    setUploading(true);
    toast.loading(`Uploading CSV file for ${field.label}...`, { id: toastId });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`${data.message || `Upload failed (Status: ${response.status})`}. Please ensure headers match: ${requiredHeadersText}`);
      }

      const statusKey = `${selectedForm}|${selectedField}`;
      await refreshUploadStatus(file.name, statusKey); 

      toast.success(data.message || 'Upload successful!', { id: toastId, duration: 4000 });

    } catch (error) {
      toast.error(`Format Error: ${error.message}`, { id: toastId, duration: 6000 });
    } finally {
      e.target.value = null;
      setUploading(false);
    }
  };

  const getFieldStatus = (formName, fieldName) => uploadStatus[`${formName}|${fieldName}`];
  
  const getFormCompletionStats = (formName) => {
    const fields = FORM_FIELDS_CONFIG[formName]?.fields || [];
    const uploadedCount = fields.filter(field => getFieldStatus(formName, field.name)?.uploaded).length;
    return { total: fields.length, uploaded: uploadedCount };
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString('en-MY', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="card">
        <div className="card-header" style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}>
          <h2 className="card-title" style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={24} /> Admin Dropdown Options Manager
          </h2>
          <p className="card-subtitle" style={{ color: '#e0e7ff', margin: '6px 0 0' }}>
            Upload CSV files to update dropdown options across all forms.
          </p>
        </div>

        <div className="form-section" style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Upload New CSV File
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label" htmlFor="form-category-select">1. Select Form</label>
              <select 
                id="form-category-select"
                name="form-category-select"
                autoComplete="off"
                value={selectedForm} 
                onChange={(e) => { setSelectedForm(e.target.value); setSelectedField(''); }} 
                className="form-input" 
                disabled={uploading || refreshing}
              >
                <option value="">-- Choose Form --</option>
                {Object.keys(FORM_FIELDS_CONFIG).map(form => (<option key={form} value={form}>{form}</option>))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="field-type-select">2. Select Field to Update</label>
              <select 
                id="field-type-select"
                name="field-type-select"
                autoComplete="off"
                value={selectedField} 
                onChange={(e) => setSelectedField(e.target.value)} 
                className="form-input" 
                disabled={!selectedForm || uploading || refreshing}
              >
                <option value="">-- Choose Field --</option>
                {selectedForm && FORM_FIELDS_CONFIG[selectedForm]?.fields.map(field => (<option key={field.name} value={field.name}>{field.label}</option>))}
              </select>
            </div>
          </div>

          <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '32px', textAlign: 'center', background: selectedForm && selectedField ? '#f9fafb' : '#f3f4f6', transition: 'all 0.3s ease' }}>
            <Upload size={48} style={{ color: 'var(--theme-primary)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              {selectedForm && selectedField
                ? `3. Choose CSV for: ${FORM_FIELDS_CONFIG[selectedForm]?.fields.find(f => f.name === selectedField)?.label}`
                : 'Select Form and Field first'}
            </p>
            {selectedField && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px', padding: '8px', backgroundColor: '#eef2ff', borderRadius: '6px', display: 'inline-block' }}>
                <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>Required Columns:</span> {EXPECTED_HEADERS[selectedField] || "'code', 'name'"}
              </p>
            )}
            <br />
            <label htmlFor="csv-upload" className={`btn btn-primary ${!(selectedForm && selectedField) || uploading || refreshing ? 'disabled' : ''}`} style={{ cursor: (selectedForm && selectedField && !uploading && !refreshing) ? 'pointer' : 'not-allowed' }}>Choose CSV File</label>
            <input 
              id="csv-upload" 
              name="csv-upload"
              autoComplete="off"
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={!selectedForm || !selectedField || uploading || refreshing} 
              style={{ display: 'none' }} 
            />
          </div>
        </div>

        <div className="form-section" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', margin: 0 }}>Current Upload Status</h3>
            <button onClick={() => refreshUploadStatus()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }} disabled={refreshing || uploading}>
              <RefreshCw size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {loadingStatus ? (
              <p>Loading status...</p>
            ) : Object.keys(FORM_FIELDS_CONFIG).length > 0 ? (
                 Object.keys(FORM_FIELDS_CONFIG).map(formName => {
                    const stats = getFormCompletionStats(formName);
                    const percentage = stats.total > 0 ? Math.round((stats.uploaded / stats.total) * 100) : 0;
                    return (
                        <div key={formName} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: '#ffffff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', margin: 0 }}>{formName}</h4>
                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', background: percentage === 100 ? '#d1fae5' : percentage > 0 ? '#fef3c7' : '#fee2e2', color: percentage === 100 ? '#065f46' : percentage > 0 ? '#92400e' : '#991b1b' }}>
                                  {stats.uploaded}/{stats.total} Updated ({percentage}%)
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', background: percentage === 100 ? '#10b981' : 'var(--theme-primary)', transition: 'width 0.3s ease' }} />
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {FORM_FIELDS_CONFIG[formName]?.fields.map(field => {
                                    const status = getFieldStatus(formName, field.name);
                                    const isUploaded = status?.uploaded; 
                                    return (
                                        <div key={field.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isUploaded ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: `1px solid ${isUploaded ? '#bbf7d0' : '#fecaca'}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                {isUploaded ? <CheckCircle size={20} style={{ color: '#10b981' }} /> : <AlertCircle size={20} style={{ color: '#ef4444' }} />}
                                                <div style={{ flex: 1 }}>
                                                  <p style={{ fontWeight: '600', color: '#374151', margin: 0, fontSize: '0.875rem' }}>{field.label}</p>
                                                  {isUploaded && status.fileName && status.fileName !== 'DB Verified' && (
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                        <FileText size={14} style={{ color: '#6b7280' }} />
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>Last file: {status.fileName}</span>
                                                      </div>
                                                  )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.75rem', color: isUploaded ? '#059669' : '#dc2626', fontWeight: '600' }}>{isUploaded ? 'Updated' : 'Not Updated'}</span>
                                                {isUploaded && status.timestamp && (
                                                   <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '4px 0 0' }}>Last Update: {formatTimestamp(status.timestamp)}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            ) : <p>No forms configured.</p>}
          </div>
        </div>
      </div>
      <style>{`
        .form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s ease; }
        .form-input:focus { border-color: var(--theme-primary); box-shadow: 0 0 0 2px var(--theme-primary); outline: none; }
        .form-input:disabled { background-color: #f3f4f6; cursor: not-allowed; opacity: 0.6; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .btn { padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary { background: linear-gradient(to right, var(--theme-primary), var(--theme-secondary)); color: #ffffff; }
        .btn-primary:hover:not(.disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn.disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.7; }
        label[for="csv-upload"].btn.disabled { background: #9ca3af; }
        label[for="csv-upload"]:hover:not(.disabled) { transform: translateY(-2px); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-bottom: 2rem; overflow: hidden; }
        .card-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
        .card-title { font-size: 1.25rem; font-weight: 600; }
        .card-subtitle { font-size: 0.875rem; }
      `}</style>
    </div>
  );
};

export default AdminUpdate;