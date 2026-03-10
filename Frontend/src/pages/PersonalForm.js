// fileName: PersonalForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Helper to format date for HTML Input (YYYY-MM-DD)
const formatDateForInput = (date) => {
    if (!date) return '';
    
    // 1. If it's a string from the backend, split it to completely avoid timezone shifting
    if (typeof date === 'string' && date.includes('T')) {
        const splitDate = date.split('T')[0];
        if (splitDate === '0001-01-01') return ''; // Ignore C# default empty DateTime
        return splitDate;
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // 2. If it's a new Date(), manually format it using local time instead of .toISOString() UTC
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const initialForm = {
    candidateId: '',
    entryDate: '', 
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    salutationCode: '',
    oldIcNumber: '',
    newIcNumber: '',
    passport: '',
    birthDate: '',
    gender: '', 
    maritalStatusCode: '',
    raceCode: '',
    nativeStatus: 'Non-Native',
    religionCode: '',
    nationalityCode: '',
    countryOfOriginCode: '',
    recommendationType: '', 
    recommendationDetails: '', 
    disability: '',
    referee1: '', 
    referee2: '' 
};

const initialSelectedDescriptions = {
    salutationDescription: '',
    maritalStatusDescription: '',
    raceDescription: '',
    religionDescription: '',
    nationalityDescription: '',
    countryOfOriginDescription: '',
};

const DROPDOWN_FETCH_CONFIG = [
    { name: 'salutation', tableName: 'salutation_code', codeKey: 'salutationCode', descriptionKey: 'salutationDescription' },
    { name: 'maritalStatus', tableName: 'marital_status_codes', codeKey: 'maritalStatusCode', descriptionKey: 'maritalStatusDescription' },
    { name: 'race', tableName: 'race_codes', codeKey: 'raceCode', descriptionKey: 'raceDescription' },
    { name: 'religion', tableName: 'religion_codes', codeKey: 'religionCode', descriptionKey: 'religionDescription' },
    { name: 'nationality', tableName: 'nationality_codes', codeKey: 'nationalityCode', descriptionKey: 'nationalityDescription' },
    { name: 'countryOfOrigin', tableName: 'country_origin_codes', codeKey: 'countryOfOriginCode', descriptionKey: 'countryOfOriginDescription' },
];

const RECOMMENDATION_TYPE_OPTIONS = [
    { code: 'EMPLOYEE', description: 'EMPLOYEE' },
    { code: 'COLLEGE', description: 'COLLEGE' },
    { code: 'AGENCY', description: 'AGENCY' },
    { code: 'ADVERTISEMENT', description: 'ADVERTISEMENT' },
    { code: 'OTHERS', description: 'OTHERS' },
];

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label>{label}</label>
        {children}
    </div>
);

const PersonalForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [selectedDescriptions, setSelectedDescriptions] = useState(initialSelectedDescriptions); 
    const [submitting, setSubmitting] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    
    const [dropdownOptions, setDropdownOptions] = useState({
        salutation: [],
        maritalStatus: [],
        race: [],
        religion: [],
        nationality: [],
        countryOfOrigin: [],
    });
    
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const fetchCandidateData = useCallback(async (id) => {
        const baseUrl = getTenantUrl('candidates');
        if (!baseUrl) return;

        setFetchingData(true);
        try {
            const url = `${baseUrl}/${id}`;
            const token = localStorage.getItem('authToken');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    setForm(prev => ({ 
                        ...prev, 
                        candidateId: id
                    }));
                    return; 
                }
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const rawData = await response.json();
            // Unwrap data if the backend returns { profile: {...} }
            const data = rawData.profile || rawData.Profile ? (rawData.profile || rawData.Profile) : rawData;
            
            if (data) {
                const getValue = (obj, key) => {
                    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
                    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                    if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey];
                    return '';
                };

                const parsedEntryDate = getValue(data, 'entryDate');
                const parsedBirthDate = getValue(data, 'birthDate');

                setForm(prev => ({
                    ...prev,
                    candidateId: getValue(data, 'candidateId') || id,
                    entryDate: formatDateForInput(parsedEntryDate) || formatDateForInput(new Date()),
                    firstName: getValue(data, 'firstName'),
                    middleName: getValue(data, 'middleName'),
                    lastName: getValue(data, 'lastName'),
                    fullName: getValue(data, 'fullName'),
                    salutationCode: getValue(data, 'salutationCode'),
                    oldIcNumber: getValue(data, 'oldIcNumber'),
                    newIcNumber: getValue(data, 'newIcNumber'),
                    passport: getValue(data, 'passport'),
                    birthDate: formatDateForInput(parsedBirthDate),
                    gender: getValue(data, 'gender'),
                    maritalStatusCode: getValue(data, 'maritalStatusCode'),
                    raceCode: getValue(data, 'raceCode'),
                    religionCode: getValue(data, 'religionCode'),
                    nationalityCode: getValue(data, 'nationalityCode'),
                    countryOfOriginCode: getValue(data, 'countryOfOriginCode'),
                    recommendationType: getValue(data, 'recommendationType'),
                    recommendationDetails: getValue(data, 'recommendationDetails'),
                    disability: getValue(data, 'disability'),
                    referee1: getValue(data, 'referee1'),
                    referee2: getValue(data, 'referee2'),
                    nativeStatus: getValue(data, 'nativeStatus') || 'Non-Native'
                }));

                setSelectedDescriptions({
                    salutationDescription: getValue(data, 'salutationDescription'),
                    maritalStatusDescription: getValue(data, 'maritalStatusDescription'),
                    raceDescription: getValue(data, 'raceDescription'),
                    religionDescription: getValue(data, 'religionDescription'),
                    nationalityDescription: getValue(data, 'nationalityDescription'),
                    countryOfOriginDescription: getValue(data, 'countryOfOriginDescription'),
                });

                if (data.fullName || data.FullName || data.firstName || data.FirstName) {
                    setIsSaved(true); 
                }
            }
        } catch (error) {
            console.error("Error loading candidate data:", error);
            toast.error("Could not load existing profile data.");
        } finally {
            setFetchingData(false);
        }
    }, [getTenantUrl]);

    const fetchDropdowns = useCallback(async () => {
        setLoadingDropdowns(true);
        const baseUrl = getTenantUrl('AdminUpdate/options');
        if (!baseUrl) return;
        
        const promises = DROPDOWN_FETCH_CONFIG.map(async (config) => {
            const { name, tableName } = config;
            try {
                const response = await fetch(`${baseUrl}/${tableName}`); 
                if (!response.ok) throw new Error(`Failed to fetch ${name} options`);
                const data = await response.json(); 
                return { name, data: Array.isArray(data) ? data : [] }; 
            } catch (error) {
                return { name, data: [] }; 
            }
        });

        const results = await Promise.allSettled(promises);
        setDropdownOptions(currentOptions => {
            let finalOptions = { ...currentOptions };
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    const { name, data } = result.value;
                    finalOptions[name] = data; 
                }
            });
            return finalOptions;
        });
        setLoadingDropdowns(false); 
    }, [getTenantUrl]); 

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            entryDate: prev.entryDate || formatDateForInput(new Date()) 
        }));

        const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
        
        if (userRole === 'admin' || userRole === 'superadmin') {
            return; 
        }

        const storedId = localStorage.getItem('candidateId');
        if (storedId) {
            fetchCandidateData(storedId);
        }
        fetchDropdowns();
    }, [fetchCandidateData, fetchDropdowns]);

    // Optional Auto-fill logic for Full Name:
    // This effect combines first, middle, and last names automatically 
    // when they change, making it easier for the user.
    useEffect(() => {
        const parts = [form.firstName, form.middleName, form.lastName].filter(p => p && p.trim() !== '');
        const computedFullName = parts.join(' ');
        
        setForm(prev => {
            // Check against prev.fullName to avoid needing form.fullName in the dependency array
            if (computedFullName !== prev.fullName && !isSaved) {
                return { ...prev, fullName: computedFullName };
            }
            return prev;
        });
    }, [form.firstName, form.middleName, form.lastName, isSaved]);

    const update = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => {
            let updatedFields = {};
            let codeKey = name;
            const dropdownConfig = DROPDOWN_FETCH_CONFIG.find(c => c.name === name);
            if (dropdownConfig) codeKey = dropdownConfig.codeKey;
            
            if (type === 'checkbox' && name === 'isNative') {
                updatedFields.nativeStatus = checked ? 'Native' : 'Non-Native';
            } else {
                updatedFields[codeKey] = value;
            }
            return { ...prev, ...updatedFields };
        });

        if (e.target.tagName === 'SELECT' && name !== 'gender' && name !== 'recommendationType') {
            const description = e.target.options[e.target.selectedIndex].text;
            const dropdownConfig = DROPDOWN_FETCH_CONFIG.find(c => c.name === name);
            if (dropdownConfig) {
                setSelectedDescriptions(prev => ({
                    ...prev,
                    [dropdownConfig.descriptionKey]: (description === 'Select' || description === 'Loading...') ? '' : description
                }));
            }
        }
    };

    const sanitizePayload = (formData) => {
        const payload = { ...formData };
        if (!payload.entryDate || payload.entryDate.trim() === '') payload.entryDate = null;
        if (!payload.birthDate || payload.birthDate.trim() === '') payload.birthDate = null;
        
        delete payload.userId;
        delete payload.companyId; 
        
        return payload;
    };

    const performSubmission = async (method, url, payload) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get("content-type");
        let errorMsg = "Failed to save information.";

        if (contentType && contentType.indexOf("application/json") !== -1) {
            const resultData = await response.json();
            errorMsg = resultData.message || resultData.error || errorMsg;
        } else {
            const textError = await response.text();
            if (textError) errorMsg = textError;
        }

        if (!response.ok) throw new Error(errorMsg);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const baseUrl = getTenantUrl('candidates');
        if (!baseUrl) {
            toast.error("Session Error: Company ID missing.");
            return;
        }

        setSubmitting(true);

        const submissionPromise = new Promise(async (resolve, reject) => {
            try {
                if (!form.firstName || form.firstName.trim() === '') throw new Error("First Name is required.");
                if (!form.lastName || form.lastName.trim() === '') throw new Error("Last Name is required.");
                if (!form.fullName || form.fullName.trim() === '') throw new Error("Full Name is required.");
                if (!form.birthDate) throw new Error("Birth Date is required.");
                if (!form.gender) throw new Error("Gender is required.");
                if (!form.nationalityCode) throw new Error("Nationality is required.");
                if (!form.newIcNumber?.trim() && !form.passport?.trim()) {
                    throw new Error("Provide New IC Number OR Passport.");
                }

                let payload = sanitizePayload(form);
                Object.keys(selectedDescriptions).forEach(key => { payload[key] = selectedDescriptions[key]; });
                
                const recOption = RECOMMENDATION_TYPE_OPTIONS.find(opt => opt.code === payload.recommendationType);
                payload.recommendationTypeDescription = recOption ? recOption.description : '';
                payload.genderDescription = payload.gender || '';

                let isUpdating = isSaved; 
                if (!isUpdating && localStorage.getItem('candidateId')) {
                    isUpdating = true;
                }

                if (isUpdating && payload.candidateId) {
                    const candidateIdToUpdate = payload.candidateId;
                    
                    const updateUrl = `${baseUrl}/${encodeURIComponent(candidateIdToUpdate)}`;
                    await performSubmission('PUT', updateUrl, payload);
                    setIsSaved(true);
                    resolve('Candidate information updated successfully');
                } else {
                    try {
                        await performSubmission('POST', baseUrl, payload);
                        setIsSaved(true);
                        resolve('Candidate information saved successfully');
                    } catch (err) {
                        if (err.message && (err.message.includes("exists") || err.message.includes("PUT"))) {
                            const idToUse = form.candidateId || localStorage.getItem('candidateId');
                            if (idToUse) {
                                payload.candidateId = idToUse; 
                                const retryUrl = `${baseUrl}/${encodeURIComponent(idToUse)}`;
                                await performSubmission('PUT', retryUrl, payload);
                                setIsSaved(true);
                                resolve('Profile updated successfully (switched from create)');
                            } else {
                                throw err;
                            }
                        } else {
                            throw err;
                        }
                    }
                }
            } catch (err) {
                reject(err?.message || 'Failed to save candidate.');
            }
        });

        toast.promise(submissionPromise, {
            loading: isSaved ? 'Updating Profile...' : 'Saving Profile...',
            success: (msg) => msg,
            error: (err) => `${err}`, 
        }).finally(() => setSubmitting(false));
    };

    const handleNext = () => navigate('/contact');

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">{fetchingData ? 'Loading Profile...' : 'Candidate Onboarding'}</h2>
                <p className="card-subtitle">{fetchingData ? 'Retrieving information.' : 'Manage your candidate details.'}</p>
            </div>
            
            {fetchingData && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading data...</div>}

            <form onSubmit={handleSubmit} style={{ opacity: fetchingData ? 0.5 : 1, pointerEvents: fetchingData ? 'none' : 'auto' }}>
                <div className="form-content-area">
                    <div className="form-section">
                        <h3>Candidate Information</h3>
                        <div className="grid">
                            <FormField label="Candidate ID">
                                <input name="candidateId" value={form.candidateId || ''} readOnly disabled className="form-input" style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}/>
                            </FormField>
                            <FormField label="Entry Date">
                                <input type="date" name="entryDate" value={form.entryDate || ''} readOnly disabled className="form-input" style={{ backgroundColor: '#f3f4f6' }} />
                            </FormField>
                        </div>

                        <div className="grid">
                            <FormField label="Select Salutation">
                                <select name="salutation" value={form.salutationCode || ''} onChange={update} disabled={loadingDropdowns || submitting} className="form-input">
                                    <option value="">{loadingDropdowns ? 'Loading...' : 'Select'}</option>
                                    {dropdownOptions.salutation.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}
                                </select>
                            </FormField>
                            <FormField label="First Name *">
                                <input name="firstName" value={form.firstName || ''} onChange={update} required className="form-input" />
                            </FormField>
                        </div>
                        
                        <div className="grid">
                            <FormField label="Middle Name">
                                <input name="middleName" value={form.middleName || ''} onChange={update} className="form-input" />
                            </FormField>
                            <FormField label="Last Name *">
                                <input name="lastName" value={form.lastName || ''} onChange={update} required className="form-input" />
                            </FormField>
                        </div>
                        
                        <div className="grid">
                            <FormField label="Full Name *" fullWidth>
                                <input name="fullName" value={form.fullName || ''} onChange={update} required className="form-input" />
                            </FormField>
                        </div>

                        <div className="grid">
                            <FormField label="Old IC Number"><input name="oldIcNumber" value={form.oldIcNumber || ''} onChange={update} className="form-input" /></FormField>
                            <FormField label="New IC Number *"><input name="newIcNumber" value={form.newIcNumber || ''} onChange={update} className="form-input" /></FormField>
                        </div>
                        <div className="grid">
                            <FormField label="Passport"><input name="passport" value={form.passport || ''} onChange={update} className="form-input" /></FormField>
                            <FormField label="Birth Date *"><input type="date" name="birthDate" value={form.birthDate || ''} onChange={update} required className="form-input" /></FormField>
                        </div>
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section">
                        <h3>Demographics</h3>
                        <div className="grid">
                            <FormField label="Gender *"><select name="gender" value={form.gender || ''} onChange={update} required className="form-input"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></FormField>
                            <FormField label="Marital Status"><select name="maritalStatus" value={form.maritalStatusCode || ''} onChange={update} disabled={loadingDropdowns || submitting} className="form-input"><option value="">Select</option>{dropdownOptions.maritalStatus.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                        </div>
                        <div className="grid">
                            <FormField label="Race"><select name="race" value={form.raceCode || ''} onChange={update} disabled={loadingDropdowns || submitting} className="form-input"><option value="">Select</option>{dropdownOptions.race.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                            <div className="field">
                                <label>Native Status</label>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                                    <input id="isNativeCheckbox" type="checkbox" name="isNative" checked={form.nativeStatus === 'Native'} onChange={update} style={{ width: '20px', height: '20px', marginRight: '8px', cursor: 'pointer' }} />
                                    <label htmlFor="isNativeCheckbox" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>Is Native</label>
                                </div>
                            </div>
                        </div>
                        <div className="grid">
                            <FormField label="Religion"><select name="religion" value={form.religionCode || ''} onChange={update} disabled={loadingDropdowns || submitting} className="form-input"><option value="">Select</option>{dropdownOptions.religion.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                            <FormField label="Nationality *"><select name="nationality" value={form.nationalityCode || ''} onChange={update} required disabled={loadingDropdowns || submitting} className="form-input"><option value="">Select</option>{dropdownOptions.nationality.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                        </div>
                        <FormField label="Country of Origin" fullWidth><select name="countryOfOrigin" value={form.countryOfOriginCode || ''} onChange={update} disabled={loadingDropdowns || submitting} className="form-input"><option value="">Select</option>{dropdownOptions.countryOfOrigin.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section">
                        <h3>Other Information</h3>
                        <FormField label="Recommendation Type" fullWidth><select name="recommendationType" value={form.recommendationType || ''} onChange={update} className="form-input"><option value="">Select</option>{RECOMMENDATION_TYPE_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.description}</option>)}</select></FormField>
                        {form.recommendationType && <FormField label="Recommendation Detail" fullWidth><input name="recommendationDetails" value={form.recommendationDetails || ''} onChange={update} placeholder="Specify details..." className="form-input"/></FormField>}
                        <FormField label="Disability" fullWidth><input name="disability" value={form.disability || ''} onChange={update} placeholder="Describe any disabilities" className="form-input" /></FormField>
                        <div className="grid">
                            <FormField label="Referee 1"><input name="referee1" value={form.referee1 || ''} onChange={update} placeholder="Name of Referee 1" className="form-input" /></FormField>
                            <FormField label="Referee 2"><input name="referee2" value={form.referee2 || ''} onChange={update} placeholder="Name of Referee 2" className="form-input" /></FormField>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-secondary" disabled={submitting} style={{ marginRight: '10px' }}>
                        {submitting ? 'Processing...' : (isSaved ? 'Update Information' : 'Save Personal Information')}
                    </button>
                    {isSaved && <button type="button" onClick={handleNext} className="btn btn-primary">Next: Contact Information &rarr;</button>}
                </div>
            </form>
        </div>
    );
};

export default PersonalForm;