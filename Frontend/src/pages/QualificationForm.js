// fileName: QualificationForm.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Trash2 } from 'lucide-react'; 

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        return dateString.split('T')[0];
    } catch (e) {
        return '';
    }
};

const initialQualification = {
    id: 0, 
    // candidateId: '', // REMOVED: Managed via Query Param now
    schoolName: '',
    joinSchoolDate: '',
    sinceWhenDate: '',
    qualificationCode: '',
    qualificationName: '', 
    qualificationSubCode: '', 
    qualificationSubName: '', 
    isHighest: false,
    qualificationGradeCode: '',
    qualificationGradeRank: '', 
    cgpa: '',
    otherGradeInfo: '',
    qualificationGradeName: '', 
    schoolTelNo: '',
    entryDate: getTodayDate(),
    schoolAddress: '',
};

const QualificationForm = () => {
    const navigate = useNavigate();
    const [qualifications, setQualifications] = useState([initialQualification]);
    const [isSaved, setIsSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidateId, setCandidateId] = useState(null);
    const [fetchingData, setFetchingData] = useState(true);

    const [mainQualOptions, setMainQualOptions] = useState([]); 
    const [gradeOptions, setGradeOptions] = useState([]);      
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [subQualOptionsState, setSubQualOptionsState] = useState({});
    const [loadingSubQuals, setLoadingSubQuals] = useState({});

    // ✅ HELPER: Construct the base tenant URL
    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const getUniqueMainQualOptions = useCallback(() => {
        return [...new Map(mainQualOptions.map(item => [item.code, item])).values()];
    }, [mainQualOptions]);

    // ✅ FETCH SUB-OPTIONS
    const fetchSubQualificationOptions = useCallback(async (index, mainCode) => {
        if (!mainCode) {
            setSubQualOptionsState(prev => ({ ...prev, [index]: [] }));
            return;
        }
        setLoadingSubQuals(prev => ({ ...prev, [index]: true }));
        try {
            const baseUrl = getTenantUrl('AdminUpdate/suboptions/qualification_codes');
            const endpoint = `${baseUrl}/${mainCode}`;
            
            const subRes = await fetch(endpoint);
            if (!subRes.ok) throw new Error('Failed to fetch sub-qualification codes.');
            const subData = await subRes.json();
            setSubQualOptionsState(prev => ({ ...prev, [index]: subData }));
        } catch (error) {
            console.error(`Error fetching sub-options for index ${index}:`, error);
            setSubQualOptionsState(prev => ({ ...prev, [index]: [] }));
        } finally {
            setLoadingSubQuals(prev => ({ ...prev, [index]: false }));
        }
    }, [getTenantUrl]);

    // ✅ FETCH DROPDOWNS
    const fetchDropdownData = useCallback(async () => {
        setLoadingDropdowns(true);
        try {
            const baseUrl = getTenantUrl('AdminUpdate/options');
            if (!baseUrl) return;

            const [qualRes, gradeRes] = await Promise.all([
                fetch(`${baseUrl}/qualification_codes`), 
                fetch(`${baseUrl}/qualification_grades`)
            ]);
            
            if (!qualRes.ok) throw new Error('Failed to fetch qualification codes.');
            if (!gradeRes.ok) throw new Error('Failed to fetch qualification grades.');

            const qualData = await qualRes.json(); 
            const gradeData = await gradeRes.json(); 

            setMainQualOptions(qualData);
            setGradeOptions(gradeData.map(opt => {
                const parts = opt.description.split('-');
                return {
                    code: opt.code,
                    description: opt.description,
                    name: parts[0]?.trim() || opt.description,
                    rank: parts[1]?.trim() || ''
                };
            }));
        } catch (error) {
            console.error("Failed to load dropdown data:", error);
            toast.error("Could not load dropdown options.");
        } finally {
            setLoadingDropdowns(false);
        }
    }, [getTenantUrl]); 

    useEffect(() => {
        const loadInitialData = async () => {
            const storedId = localStorage.getItem("candidateId");
            if (!storedId) {
                toast.error("No Candidate ID found.");
                setFetchingData(false);
                return;
            } 
            
            setCandidateId(storedId);
            await fetchDropdownData();

            try {
                const baseUrl = getTenantUrl('Qualification');
                if (baseUrl) {
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
                                    // candidateId: storedId, // No longer needed in state for display
                                    schoolName: getValue('schoolName'),
                                    joinSchoolDate: formatDateForInput(getValue('joinSchoolDate')),
                                    sinceWhenDate: formatDateForInput(getValue('sinceWhenDate')),
                                    qualificationCode: getValue('qualificationCode'),
                                    qualificationName: getValue('qualificationName'),
                                    qualificationSubCode: getValue('qualificationSubCode'),
                                    qualificationSubName: getValue('qualificationSubName'),
                                    isHighest: !!getValue('isHighest'),
                                    qualificationGradeCode: getValue('qualificationGradeCode'),
                                    qualificationGradeRank: getValue('qualificationGradeRank'),
                                    cgpa: getValue('cgpa'),
                                    otherGradeInfo: getValue('otherGradeInfo'),
                                    qualificationGradeName: getValue('qualificationGradeName'),
                                    schoolTelNo: getValue('schoolTelNo'),
                                    entryDate: formatDateForInput(getValue('entryDate')) || getTodayDate(),
                                    schoolAddress: getValue('schoolAddress'),
                                };
                            });
                            setQualifications(formattedData);
                            setIsSaved(true);
                            formattedData.forEach((q, index) => {
                                if (q.qualificationCode) {
                                    fetchSubQualificationOptions(index, q.qualificationCode);
                                }
                            });
                        } 
                    }
                }
            } catch (error) {
                console.error("Failed to load qualifications:", error);
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, [fetchDropdownData, fetchSubQualificationOptions, getTenantUrl]); 

    const handleChange = (index, eventOrCustomObject) => {
        const isCheckbox = eventOrCustomObject.target && eventOrCustomObject.target.type === 'checkbox';
        const name = eventOrCustomObject.target ? eventOrCustomObject.target.name : eventOrCustomObject.name;
        const value = isCheckbox ? eventOrCustomObject.target.checked : (eventOrCustomObject.target ? eventOrCustomObject.target.value : eventOrCustomObject.value);

        if (isSaved) setIsSaved(false);

        const newQualifications = qualifications.map((qualification, i) => {
            if (i === index) {
                let updatedFields = { [name]: value };
                if (name === 'qualificationCode') {
                    const selectedQual = getUniqueMainQualOptions().find(q => q.code === value) || {};
                    updatedFields = { ...updatedFields, qualificationName: selectedQual.description || '', qualificationSubCode: '', qualificationSubName: '' };
                    fetchSubQualificationOptions(index, value); 
                }
                if (name === 'qualificationSubCode') {
                    const selectedSubOption = subQualOptionsState[index]?.find(q => q.code === value); 
                    updatedFields = { ...updatedFields, qualificationSubName: selectedSubOption?.description || '' };
                }
                if (name === 'qualificationGradeCode') {
                    const selectedGrade = gradeOptions.find(g => g.code === value) || {};
                    updatedFields = { ...updatedFields, qualificationGradeName: selectedGrade.name || '', qualificationGradeRank: selectedGrade.rank || '' };
                }
                return { ...qualification, ...updatedFields };
            }
            return qualification;
        });
        setQualifications(newQualifications);
    };

    const getSubQualificationsForIndex = (index) => subQualOptionsState[index] || [];

    const handleAddQualification = () => {
        if (isSaved) setIsSaved(false);
        setQualifications([...qualifications, { ...initialQualification, entryDate: getTodayDate() }]);
        toast.success('New qualification form added!');
    };

    const handleRemoveQualification = (index) => {
        if (qualifications.length > 1) {
            if (isSaved) setIsSaved(false);
            setQualifications(qualifications.filter((_, i) => i !== index));
            setSubQualOptionsState(prev => {
                const newState = {};
                Object.keys(prev).forEach(key => {
                    const k = parseInt(key);
                    if (k < index) newState[k] = prev[k];
                    if (k > index) newState[k - 1] = prev[k];
                });
                return newState;
            });
            toast.error('Qualification removed.');
        } else {
            toast.error('You must have at least one qualification entry.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!candidateId) {
             toast.error("Cannot save: Missing Candidate ID.");
             return;
        }

        // Duplicate Check
        const uniqueEntries = new Set();
        let hasInternalDuplicates = false;
        for (const q of qualifications) {
            const subCode = q.qualificationSubCode || "";
            const gradeCode = q.qualificationGradeCode || "";
            const uniqueKey = `${subCode}|${gradeCode}`;
            if (subCode !== "" || gradeCode !== "") {
                if (uniqueEntries.has(uniqueKey)) {
                    hasInternalDuplicates = true;
                    break;
                }
                uniqueEntries.add(uniqueKey);
            }
        }
        if (hasInternalDuplicates) {
            toast.error("Duplicate data in form! Same sub-code and grade combination detected.");
            return; 
        }

        setIsSubmitting(true);
        const baseUrl = getTenantUrl('Qualification');
        const storedCompanyId = localStorage.getItem('companyId');
        
        if (!baseUrl || !storedCompanyId) {
            toast.error("Session Error: Company ID missing.");
            setIsSubmitting(false);
            return;
        }

        // ✅ CRITICAL FIX: Do NOT include candidateId in the body
        // The backend expects a Guid, but candidateId is a string ("CAND...").
        // This mismatch causes the backend to reject the payload.
        const payload = qualifications.map(q => ({
            ...q,
            // candidateId: candidateId, // REMOVED
            companyId: storedCompanyId,
            cgpa: q.cgpa ? String(q.cgpa) : null 
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
            
            // Format response for display
            const formattedData = savedData.map(item => {
                const getValue = (key) => item[key] || item[key.charAt(0).toUpperCase() + key.slice(1)] || '';
                return {
                    id: getValue('id'),
                    candidateId: candidateId,
                    schoolName: getValue('schoolName'),
                    joinSchoolDate: formatDateForInput(getValue('joinSchoolDate')),
                    sinceWhenDate: formatDateForInput(getValue('sinceWhenDate')),
                    qualificationCode: getValue('qualificationCode'),
                    qualificationName: getValue('qualificationName'),
                    qualificationSubCode: getValue('qualificationSubCode'),
                    qualificationSubName: getValue('qualificationSubName'),
                    isHighest: !!getValue('isHighest'),
                    qualificationGradeCode: getValue('qualificationGradeCode'),
                    qualificationGradeRank: getValue('qualificationGradeRank'),
                    cgpa: getValue('cgpa'),
                    otherGradeInfo: getValue('otherGradeInfo'),
                    qualificationGradeName: getValue('qualificationGradeName'),
                    schoolTelNo: getValue('schoolTelNo'),
                    entryDate: formatDateForInput(getValue('entryDate')),
                    schoolAddress: getValue('schoolAddress'),
                };
            });
            
            setQualifications(formattedData);
            setIsSaved(true);
            return `Successfully saved ${savedData.length} qualification(s)!`;
        };

        toast.promise(saveOperation(), {
            loading: 'Saving qualification details...',
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

    const handleNext = () => navigate('/employment');

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={20} /> Qualification Details</h2>
                <p className="card-subtitle">{fetchingData ? "Loading your qualifications..." : "Enter details for all relevant qualifications."}</p>
            </div>
            {fetchingData && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading data...</div>}
            <form onSubmit={handleSubmit} style={{ opacity: fetchingData ? 0.5 : 1, pointerEvents: fetchingData ? 'none' : 'auto' }}>
                <div className="form-content-area">
                    {qualifications.map((qualification, index) => (
                        <div key={index} className="form-section p-4 mb-6 border border-gray-200 rounded-lg relative shadow-sm" style={{ border: '1px solid #d1d5db' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="text-lg font-semibold text-gray-700" style={{ margin: 0 }}>Qualification Entry #{index + 1}</h3>
                                {qualifications.length > 1 && <button type="button" onClick={() => handleRemoveQualification(index)} className="btn btn-danger" disabled={isSubmitting}><Trash2 size={16} style={{ marginRight: '4px' }} />Remove</button>}
                            </div>
                            <div className="sub-form-section">
                                <h4>School Information</h4>
                                <div className="grid"><FormField label="School Name *"><input type="text" name="schoolName" value={qualification.schoolName} onChange={(e) => handleChange(index, e)} required className="form-input"/></FormField><FormField label="School Telephone No."><input type="tel" name="schoolTelNo" value={qualification.schoolTelNo} onChange={(e) => handleChange(index, e)} className="form-input"/></FormField></div>
                                <div className="grid"><FormField label="School Address" fullWidth><textarea name="schoolAddress" value={qualification.schoolAddress} onChange={(e) => handleChange(index, e)} rows="2" className="form-input"/></FormField></div>
                                <div className="grid"><FormField label="Join School (Start Date) *"><input type="date" name="joinSchoolDate" value={qualification.joinSchoolDate} onChange={(e) => handleChange(index, e)} required className="form-input"/></FormField><FormField label="Graduation/Leaving Date *"><input type="date" name="sinceWhenDate" value={qualification.sinceWhenDate} onChange={(e) => handleChange(index, e)} required className="form-input"/></FormField></div>
                                <div className="grid"><FormField label="Entry Date"><input type="date" name="entryDate" value={qualification.entryDate} readOnly disabled className="form-input"/></FormField><div className="field"></div></div>
                            </div>
                            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e5e7eb'}} />
                            <div className="sub-form-section">
                                <h4>Qualification Details</h4>
                                <div className="grid">
                                    <FormField label="Qualification Code *"><select name="qualificationCode" value={qualification.qualificationCode} onChange={(e) => handleChange(index, e)} required disabled={loadingDropdowns || isSubmitting} className="form-input"><option value="">{loadingDropdowns ? 'Loading...' : 'Select Code'}</option>{getUniqueMainQualOptions().map((opt) => (<option key={opt.code} value={opt.code}>{opt.code} - {opt.description}</option>))}</select></FormField>
                                    <FormField label="Qualification Name *"><input type="text" name="qualificationName" value={qualification.qualificationName} readOnly disabled className="form-input"/></FormField>
                                </div>
                                <div className="grid">
                                    <FormField label="Qualification Sub Code"><select name="qualificationSubCode" value={qualification.qualificationSubCode} onChange={(e) => handleChange(index, e)} disabled={loadingDropdowns || isSubmitting || !qualification.qualificationCode || loadingSubQuals[index]} className="form-input"><option value="">{loadingSubQuals[index] ? 'Loading Sub Codes...' : (!qualification.qualificationCode ? 'Select Main Code First' : (getSubQualificationsForIndex(index).length > 0 ? 'Select Sub Code' : 'No Sub Codes Available'))}</option>{getSubQualificationsForIndex(index).map((opt) => (<option key={opt.code} value={opt.code}>{opt.code} - {opt.description}</option>))}</select></FormField>
                                    <FormField label="Qualification Sub Name"><input type="text" name="qualificationSubName" value={qualification.qualificationSubName} readOnly disabled className="form-input"/></FormField>
                                </div>
                                <div className="grid"><div className="field full-width-field"><label className="form-label" style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', marginTop: '10px' }}><input type="checkbox" name="isHighest" checked={qualification.isHighest} onChange={(e) => handleChange(index, e)} style={{ marginRight: '10px', transform: 'scale(1.3)' }} disabled={isSubmitting}/><span>Is this your Highest Qualification?</span></label></div></div>
                            </div>
                            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e5e7eb'}} />
                            <div className="sub-form-section">
                                <h4>Grade Information</h4>
                                <div className="grid">
                                    <FormField label="Grade Code"><select name="qualificationGradeCode" value={qualification.qualificationGradeCode} onChange={(e) => handleChange(index, e)} disabled={loadingDropdowns || isSubmitting} className="form-input"><option value="">{loadingDropdowns ? 'Loading...' : 'Select Code (Optional)'}</option>{gradeOptions.map((opt) => (<option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>))}</select></FormField>
                                    <FormField label="Grade Name"><input type="text" name="qualificationGradeName" value={qualification.qualificationGradeName} readOnly disabled className="form-input"/></FormField>
                                </div>
                                <div className="grid"><FormField label="Grade Rank/Division"><input type="text" name="qualificationGradeRank" value={qualification.qualificationGradeRank} readOnly disabled className="form-input"/></FormField><FormField label="CGPA / GPA"><input type="number" step="0.01" name="cgpa" value={qualification.cgpa} onChange={(e) => handleChange(index, e)} placeholder="e.g. 3.75" className="form-input" disabled={isSubmitting}/></FormField></div>
                                <div className="grid"><FormField label="Other Grade Info" fullWidth><textarea name="otherGradeInfo" value={qualification.otherGradeInfo} onChange={(e) => handleChange(index, e)} rows="2" placeholder="e.g., Thesis Title/Score, Specific Awards" className="form-input" disabled={isSubmitting}/></FormField></div>
                            </div>
                            {index < qualifications.length - 1 && (<hr style={{ margin: '30px 0', borderTop: '2px dashed #e5e7eb' }} />)}
                        </div>
                    ))}
                </div>
                <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                    <button type="button" onClick={handleAddQualification} className="btn btn-secondary" disabled={isSubmitting}>+ Add Another Qualification</button>
                    {isSaved ? (
                        <><button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Qualifications'}</button><button type="button" onClick={handleNext} className="btn btn-primary" style={{ minWidth: '180px' }}>Next: Employment History &rarr;</button></>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : `Save Qualifications (${qualifications.length})`}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default QualificationForm;