// fileName: EmploymentHistoryForm.js
import React, { useState, useEffect, useCallback } from 'react'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Trash2 } from 'lucide-react';

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const tableNames = { industryCode: 'industry_codes', jobCode: 'job_codes', cessationReason: 'cessation_reasons' };

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        return dateString.split('T')[0];
    } catch (e) {
        return '';
    }
};

const initialRecordState = {
    id: 0, 
    employerName: '',
    fromDate: '',
    toDate: '',
    latest: false,
    industryCode: '',
    jobCode: '', 
    cessationReason: '', 
    startSalary: '',
    lastSalary: '',
    jobFunction: '',
    jobName: '', 
    emphJobName: '',
    cessationReasonDescription: '', 
    telNo: '',
    entryDate: new Date().toISOString().substring(0, 10),
    address: '',
};

const EmploymentRecord = ({ record, index, totalRecords, handleChange, handleRemove, industryOptions, jobOptions, cessationOptions, loading }) => {
    const idPrefix = `record-${index}-`;
    const handleRecordChange = (e) => handleChange(index, e);

    return (
        <div className="form-section employment-record-entry p-4 mb-6 border border-gray-200 rounded-lg relative shadow-sm" style={{ border: '1px solid #d1d5db', position: 'relative', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="text-lg font-semibold text-gray-700" style={{ margin: 0 }}>Employment Record #{index + 1}</h3>
                {totalRecords > 1 && <button type="button" onClick={() => handleRemove(index)} className="btn btn-danger"><Trash2 size={16} style={{ marginRight: '4px' }} />Remove</button>}
            </div>
            <div className="grid"><FormField label="Employer Name"><input id={`${idPrefix}employerName`} type="text" name="employerName" value={record.employerName} onChange={handleRecordChange} className="form-input"/></FormField><FormField label="Telephone No."><input id={`${idPrefix}telNo`} type="tel" name="telNo" value={record.telNo} onChange={handleRecordChange} className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Employer Address" fullWidth><textarea id={`${idPrefix}address`} name="address" value={record.address} onChange={handleRecordChange} rows="2" className="form-input"/></FormField></div>
            <div className="grid"><FormField label="From Date"><input id={`${idPrefix}fromDate`} type="date" name="fromDate" value={record.fromDate} onChange={handleRecordChange} className="form-input"/></FormField><FormField label="To Date"><input id={`${idPrefix}toDate`} type="date" name="toDate" value={record.toDate} onChange={handleRecordChange} className="form-input"/></FormField><div className="field" style={{ alignSelf: 'center', paddingTop: '20px' }}><label htmlFor={`${idPrefix}latest`} style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input id={`${idPrefix}latest`} type="checkbox" name="latest" checked={record.latest} onChange={(e) => handleRecordChange(e)} style={{ marginRight: '10px', transform: 'scale(1.3)', cursor: 'pointer' }}/><span>Latest Employment?</span></label></div></div>
            <div className="grid"><FormField label="Industry Code"><select id={`${idPrefix}industryCode`} name="industryCode" value={record.industryCode} onChange={handleRecordChange} className="form-input" disabled={loading}><option value="">{loading ? 'Loading...' : 'Select Industry'}</option>{industryOptions.filter(option => option.code && option.description).map(option => (<option key={option.code} value={option.code}>{option.code} - {option.description}</option>))}</select></FormField><FormField label="Job Code"><select id={`${idPrefix}jobCode`} name="jobCode" value={record.jobCode} onChange={handleRecordChange} className="form-input" disabled={loading}><option value="">{loading ? 'Loading...' : 'Select Job Title'}</option>{jobOptions.filter(option => option.code && option.description).map(option => (<option key={option.code} value={option.code}>{option.code} - {option.description}</option>))}</select></FormField></div>
            <div className="grid"><FormField label="Job Title"><input id={`${idPrefix}jobName`} type="text" name="jobName" value={record.jobName} readOnly disabled className="form-input" style={{ backgroundColor: '#f3f4f6' }}/></FormField></div>
            <div className="grid"><FormField label="Start Salary"><input id={`${idPrefix}startSalary`} type="number" name="startSalary" value={record.startSalary} onChange={handleRecordChange} placeholder="e.g., 3000" min="0" className="form-input"/></FormField><FormField label="Last Salary"><input id={`${idPrefix}lastSalary`} type="number" name="lastSalary" value={record.lastSalary} onChange={handleRecordChange} placeholder="e.g., 5000" min="0" className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Emphasized Job Name / Specialty"><input id={`${idPrefix}emphJobName`} type="text" name="emphJobName" value={record.emphJobName} onChange={handleRecordChange} placeholder="e.g., Frontend Specialist" className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Job Function / Responsibilities" fullWidth><textarea id={`${idPrefix}jobFunction`} name="jobFunction" value={record.jobFunction} onChange={handleRecordChange} rows="3" className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Cessation Reason"><select id={`${idPrefix}cessationReason`} name="cessationReason" value={record.cessationReason} onChange={handleRecordChange} className="form-input" disabled={loading}><option value="">{loading ? 'Loading...' : 'Select Reason'}</option>{cessationOptions.filter(option => option.code && option.description).map(option => (<option key={option.code} value={option.code}>{option.code} - {option.description}</option>))}</select></FormField><FormField label="Entry Date"><input id={`${idPrefix}entryDate`} type="date" name="entryDate" value={record.entryDate} readOnly disabled className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Cessation Reason Description" fullWidth><textarea id={`${idPrefix}cessationReasonDescription`} name="cessationReasonDescription" value={record.cessationReasonDescription} onChange={handleRecordChange} rows="2" placeholder="Provide more detail (if applicable)." className="form-input"/></FormField></div>
            {index < totalRecords - 1 && (<hr style={{ margin: '30px 0', borderTop: '2px dashed #e5e7eb' }} />)}
        </div>
    );
};

const EmploymentHistoryForm = () => {
    const navigate = useNavigate();
    const [employmentRecords, setEmploymentRecords] = useState([initialRecordState]);
    const [isSaved, setIsSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [candidateId, setCandidateId] = useState(null);

    const [industryOptions, setIndustryOptions] = useState([]);
    const [jobOptions, setJobOptions] = useState([]);
    const [cessationOptions, setCessationOptions] = useState([]);

    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const fetchOptions = useCallback(async (tableName, setState) => {
        const baseUrl = getTenantUrl('AdminUpdate/options');
        if (!baseUrl) return;

        try {
            const response = await fetch(`${baseUrl}/${tableName}`);
            if (!response.ok) throw new Error(`Failed to fetch ${tableName}`);
            const data = await response.json();
            if (Array.isArray(data)) setState(data);
            else setState([]);
        } catch (error) {
            console.error(`Error fetching options for ${tableName}:`, error);
            setState([]); 
        }
    }, [getTenantUrl]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const storedId = localStorage.getItem("candidateId");

            if (!storedId) {
                toast.error("No Candidate ID found. Please ensure you are logged in.");
                setLoading(false);
                return;
            } else {
                setCandidateId(storedId);
            }

            await Promise.all([
                fetchOptions(tableNames.industryCode, setIndustryOptions),
                fetchOptions(tableNames.jobCode, setJobOptions),
                fetchOptions(tableNames.cessationReason, setCessationOptions)
            ]);

            const baseUrl = getTenantUrl('EmploymentHistory');
            if (storedId && baseUrl) {
                try {
                    const url = `${baseUrl}/${storedId}`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const formattedData = data.map(item => {
                                const getValue = (key) => {
                                    if (item[key] !== undefined && item[key] !== null) return item[key];
                                    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    if (item[pascalKey] !== undefined && item[pascalKey] !== null) return item[pascalKey];
                                    return '';
                                };
                                return {
                                    id: getValue('id') || 0,
                                    employerName: getValue('employerName'),
                                    fromDate: formatDateForInput(getValue('fromDate')),
                                    toDate: formatDateForInput(getValue('toDate')),
                                    latest: !!getValue('latest'),
                                    industryCode: getValue('industryCode'),
                                    jobCode: getValue('jobCode'),
                                    cessationReason: getValue('cessationReasonCode') || getValue('cessationReason'), 
                                    startSalary: getValue('startSalary') ? String(getValue('startSalary')) : '',
                                    lastSalary: getValue('lastSalary') ? String(getValue('lastSalary')) : '',
                                    jobFunction: getValue('jobFunction'),
                                    jobName: getValue('jobName'),
                                    emphJobName: getValue('emphJobName'),
                                    cessationReasonDescription: getValue('cessationReasonDescription'),
                                    telNo: getValue('telNo'),
                                    entryDate: formatDateForInput(getValue('entryDate')),
                                    address: getValue('address')
                                };
                            });
                            setEmploymentRecords(formattedData);
                            setIsSaved(true);
                        } 
                    }
                } catch (error) {
                    console.error("Failed to load existing employment history:", error);
                }
            }
            setLoading(false);
        };
        loadInitialData();
    }, [fetchOptions, getTenantUrl]);

    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        if (isSaved) setIsSaved(false);
        setEmploymentRecords(prevRecords => {
            const newRecords = [...prevRecords];
            const currentRecord = { ...newRecords[index], [name]: type === 'checkbox' ? checked : value };
            if (name === 'jobCode') {
                const selectedJob = jobOptions.find(option => option.code === value);
                currentRecord.jobName = selectedJob ? selectedJob.description : '';
            }
            if (name === 'cessationReason') {
                const selectedReason = cessationOptions.find(option => option.code === value);
                const currentDesc = currentRecord.cessationReasonDescription;
                const isStandardDesc = cessationOptions.some(opt => opt.description === currentDesc) || currentDesc === '';
                if (isStandardDesc) {
                   currentRecord.cessationReasonDescription = selectedReason ? selectedReason.description : '';
                }
            }
            if (name === 'latest' && checked) {
                for (let i = 0; i < newRecords.length; i++) {
                    if (i !== index) newRecords[i] = { ...newRecords[i], latest: false };
                }
            }
            newRecords[index] = currentRecord;
            return newRecords;
        });
    };

    const handleAddRecord = () => {
        if (isSaved) setIsSaved(false);
        setEmploymentRecords(prevRecords => [...prevRecords, { ...initialRecordState, entryDate: new Date().toISOString().substring(0, 10) }]);
        toast.success('New employment record form added!');
    };

    const handleRemoveRecord = (indexToRemove) => {
        if (employmentRecords.length > 1) {
            if (isSaved) setIsSaved(false);
            setEmploymentRecords(prevRecords => prevRecords.filter((_, index) => index !== indexToRemove));
            toast.error('Employment record removed.');
        } else {
            toast.error('You must have at least one employment record entry.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!candidateId) {
            toast.error("Cannot save: Missing Candidate ID.");
            return;
        }

        const baseUrl = getTenantUrl('EmploymentHistory');
        const storedCompanyId = localStorage.getItem('companyId');
        
        if (!baseUrl || !storedCompanyId) {
            toast.error("Session Error: Company ID missing.");
            return;
        }

        setIsSubmitting(true);

        // ✅ CRITICAL FIX: Do NOT include candidateId in the body
        // The backend expects a GUID, but candidateId is a string ("CAND...").
        const payload = employmentRecords.map(r => ({
            // candidateId: candidateId, // REMOVED
            companyId: storedCompanyId, 
            employerName: r.employerName,
            telNo: r.telNo || null,
            address: r.address || null,
            fromDate: r.fromDate || null, 
            toDate: r.toDate ? r.toDate : null,
            latest: r.latest,
            industryCode: r.industryCode || null,
            jobCode: r.jobCode || null,
            jobName: r.jobName,
            emphJobName: r.emphJobName || null,
            jobFunction: r.jobFunction || null,
            startSalary: r.startSalary ? parseFloat(r.startSalary) : null,
            lastSalary: r.lastSalary ? parseFloat(r.lastSalary) : null,
            cessationReasonCode: r.cessationReason || null,
            cessationReasonDescription: r.cessationReasonDescription || null,
            entryDate: r.entryDate
        }));

        const saveOperation = async () => {
            // ✅ CRITICAL FIX: Send candidateId as a Query Parameter
            const url = `${baseUrl}?candidateId=${encodeURIComponent(candidateId)}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to save data.");
            }
            const savedData = await response.json();
            
            const formattedData = savedData.map(item => {
                const getValue = (key) => item[key] || item[key.charAt(0).toUpperCase() + key.slice(1)] || '';
                return {
                    id: getValue('id'),
                    employerName: getValue('employerName'),
                    fromDate: formatDateForInput(getValue('fromDate')),
                    toDate: formatDateForInput(getValue('toDate')),
                    latest: !!getValue('latest'),
                    industryCode: getValue('industryCode'),
                    jobCode: getValue('jobCode'),
                    cessationReason: getValue('cessationReasonCode') || getValue('cessationReason'),
                    startSalary: getValue('startSalary') ? String(getValue('startSalary')) : '',
                    lastSalary: getValue('lastSalary') ? String(getValue('lastSalary')) : '',
                    jobFunction: getValue('jobFunction'),
                    jobName: getValue('jobName'),
                    emphJobName: getValue('emphJobName'),
                    cessationReasonDescription: getValue('cessationReasonDescription'),
                    telNo: getValue('telNo'),
                    entryDate: formatDateForInput(getValue('entryDate')),
                    address: getValue('address')
                };
            });
            setEmploymentRecords(formattedData);
            setIsSaved(true);
            return `Successfully saved ${savedData.length} employment record(s)!`;
        };

        toast.promise(saveOperation(), {
            loading: 'Saving employment history...',
            success: (msg) => msg,
            error: (err) => {
                setIsSaved(false);
                return err.message || "An error occurred";
            },
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleNext = () => navigate('/skills');

    return (
        <div className="card">
            <div className="card-header"><h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> Employment History</h2><p className="card-subtitle">{loading ? "Loading history..." : "Please list your previous employment, starting with the most recent."}</p></div>
            {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading data...</div>}
            <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                <div className="form-content-area">
                    {employmentRecords.map((record, index) => (
                        <EmploymentRecord key={index} index={index} record={record} totalRecords={employmentRecords.length} handleChange={handleChange} handleRemove={handleRemoveRecord} industryOptions={industryOptions} jobOptions={jobOptions} cessationOptions={cessationOptions} loading={loading}/>
                    ))}
                </div>
                <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                    <button type="button" onClick={handleAddRecord} className="btn btn-secondary" disabled={isSubmitting} >+ Add Employment Record</button>
                    {isSaved ? (
                        <><button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update History'}</button><button type="button" onClick={handleNext} className="btn btn-primary" style={{ minWidth: '180px' }}>Next: Skills Page &rarr;</button></>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : `Save Employment History (${employmentRecords.length})`}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EmploymentHistoryForm;