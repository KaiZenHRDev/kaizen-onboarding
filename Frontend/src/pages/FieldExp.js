// fileName: FieldExp.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom'; 
import { MapPin, Trash2 } from 'lucide-react';

const FIELD_AREA_FETCH_CONFIG = { tableName: 'field_area_codes', fallbackLabel: 'Field Area Code' };
const INITIAL_FIELD_OPTIONS = [{ code: '', description: 'Select Field Area Code' }];

const createFieldCodeMap = (options) => {
    return options.reduce((map, option) => { map[option.code] = option.description; return map; }, {});
};

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const initialFieldExp = { id: 0, fieldAreaCode: '', yearInField: '', fieldAreaName: INITIAL_FIELD_OPTIONS[0].description, remark: '', entryDate: getTodayDate(), };

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const FieldExperienceEntry = ({ index, record, onChange, onRemove, canRemove, fieldAreaOptions, isLoadingOptions }) => {
    const defaultLabel = isLoadingOptions ? 'Loading...' : 'Select Field Area Code';
    const isDataReady = !isLoadingOptions && fieldAreaOptions.length > 1;
    return (
        <div className="form-section-entry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 className="text-md font-semibold text-gray-600">Field Experience Entry #{index + 1}</h4>
                {canRemove && <button type="button" onClick={onRemove} className="btn btn-danger" aria-label={`Remove Field Experience #${index + 1}`}><Trash2 size={16} style={{ marginRight: '4px' }} />Remove</button>}
            </div>
            <div className="grid"> 
                <FormField label="Field Area Code">
                    <div style={{ position: 'relative' }}>
                        <select name="fieldAreaCode" value={record.fieldAreaCode} onChange={onChange} className="form-input" disabled={!isDataReady}>
                            <option value="" disabled={isDataReady}>{defaultLabel}</option>
                            {fieldAreaOptions.filter(option => option.code !== '').map(option => (<option key={option.code} value={option.code}>{option.code ? `${option.code} - ${option.description}` : option.description}</option>))}
                        </select>
                    </div>
                </FormField>
                <FormField label="Year(s) in Field">
                    <input type="number" name="yearInField" value={record.yearInField} onChange={onChange} min="0" placeholder="e.g., 5" className="form-input"/>
                </FormField>
            </div>
            <div className="grid"><FormField label="Field Area Name" fullWidth><input type="text" name="fieldAreaName" value={record.fieldAreaName} onChange={onChange} readOnly placeholder="Auto-populated" className="form-input" disabled/></FormField></div>
            <div className="grid"><FormField label="Remark" fullWidth><textarea name="remark" value={record.remark} onChange={onChange} rows="2" placeholder="Provide more detail about your experience..." className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Entry Date"><input type="date" name="entryDate" value={record.entryDate} readOnly className="form-input" disabled/></FormField><div className="field"></div></div>
        </div>
    );
};

const FieldExp = () => {
    const navigate = useNavigate(); 
    const [fieldExperiences, setFieldExperiences] = useState([initialFieldExp]);
    const [isSaved, setIsSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidateId, setCandidateId] = useState(null);
    
    const [fieldAreaOptions, setFieldAreaOptions] = useState(INITIAL_FIELD_OPTIONS);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const FIELD_AREA_CODE_MAP = createFieldCodeMap(fieldAreaOptions);

    const fetchFieldAreaCodes = useCallback(async () => {
        const baseUrl = getTenantUrl('AdminUpdate/options');
        if (!baseUrl) return;

        setIsLoadingOptions(true);
        setFetchError(null);
        try {
            const response = await fetch(`${baseUrl}/${FIELD_AREA_FETCH_CONFIG.tableName}`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json(); 
            const formattedOptions = data.map(item => ({ code: item.code || item.Code, description: item.description || item.Description }));
            setFieldAreaOptions([...INITIAL_FIELD_OPTIONS, ...formattedOptions]);
        } catch (error) {
            console.error("Failed to fetch field area codes:", error);
            setFetchError(`Could not load options for ${FIELD_AREA_FETCH_CONFIG.fallbackLabel}.`);
            setFieldAreaOptions([{ code: '', description: `Failed to load ${FIELD_AREA_FETCH_CONFIG.fallbackLabel}` }]);
        } finally {
            setIsLoadingOptions(false);
        }
    }, [getTenantUrl]);

    const fetchExistingData = useCallback(async (id) => {
        if (!id) return;
        const baseUrl = getTenantUrl('FieldExperience');
        if (!baseUrl) return;

        try {
            const response = await fetch(`${baseUrl}/${id}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const formattedData = data.map(item => {
                        const getValue = (key) => {
                            if (item[key] !== undefined && item[key] !== null) return item[key];
                            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                            if (item[pascalKey] !== undefined && item[pascalKey] !== null) return item[pascalKey];
                            return '';
                        };
                        return {
                            id: getValue('id'),
                            fieldAreaCode: getValue('fieldAreaCode'),
                            yearInField: getValue('yearsOfExperience'),
                            fieldAreaName: getValue('fieldName') || '', 
                            remark: getValue('description') || '',
                            entryDate: (getValue('entryDate') || getTodayDate()).split('T')[0],
                        };
                    });
                    setFieldExperiences(formattedData);
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error("Failed to load existing field experiences:", error);
        }
    }, [getTenantUrl]);

    useEffect(() => {
        const init = async () => {
            const storedId = localStorage.getItem("candidateId");
            if (!storedId) {
                 toast.error("No Candidate ID found. Please ensure you are logged in.");
            } else {
                 setCandidateId(storedId);
                 await fetchExistingData(storedId);
            }
            await fetchFieldAreaCodes();
        };
        init();
    }, [fetchFieldAreaCodes, fetchExistingData]);

    useEffect(() => {
        if (fieldAreaOptions.length > 1) {
             setFieldExperiences(prev => prev.map(rec => ({ ...rec, fieldAreaName: FIELD_AREA_CODE_MAP[rec.fieldAreaCode] || rec.fieldAreaName })));
        }
    }, [fieldAreaOptions, FIELD_AREA_CODE_MAP]);

    const handleChange = (index, e) => {
        if (isSaved) setIsSaved(false);
        const { name, value } = e.target;
        let newValue = value;
        let extraUpdates = {};
        if (name === 'fieldAreaCode') {
            const newFieldName = FIELD_AREA_CODE_MAP[newValue] || (newValue === '' ? INITIAL_FIELD_OPTIONS[0].description : '');
            extraUpdates = { fieldAreaName: newFieldName };
        }
        const updatedRecords = fieldExperiences.map((record, i) => i === index ? { ...record, [name]: newValue, ...extraUpdates } : record);
        setFieldExperiences(updatedRecords);
    };

    const handleAddRecord = () => {
        if (isSaved) setIsSaved(false);
        setFieldExperiences([...fieldExperiences, { ...initialFieldExp, entryDate: getTodayDate() }]);
        toast.success('New field experience form added!');
    };

    const handleRemoveRecord = (index) => {
        if (isSaved) setIsSaved(false);
        if (fieldExperiences.length > 1) {
            setFieldExperiences(fieldExperiences.filter((_, i) => i !== index));
            toast.error('Field experience record removed.');
        } else {
            toast.error("You must have at least one Field Experience entry.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const baseUrl = getTenantUrl('FieldExperience');
        const storedCompanyId = localStorage.getItem('companyId');

        if (!candidateId || !baseUrl) {
            toast.error("Required session information is missing.");
            return;
        }

        setIsSubmitting(true);

        // ✅ FIX 1: Do NOT include candidateId in the body (avoids Guid Type Mismatch)
        const payload = fieldExperiences.map(rec => ({
            companyId: storedCompanyId, 
            fieldAreaCode: rec.fieldAreaCode,
            fieldName: rec.fieldAreaName,
            yearsOfExperience: parseInt(rec.yearInField, 10) || 0, 
            description: rec.remark,
            entryDate: rec.entryDate
        }));

        const saveOperation = async () => {
            // ✅ FIX 2: Pass candidateId via URL Query String
            const url = `${baseUrl}?candidateId=${encodeURIComponent(candidateId)}`;
            
            // ✅ FIX 3: Use the constructed 'url' instead of 'baseUrl'
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to save data.");
            }
            setIsSaved(true); 
            return `Successfully saved ${fieldExperiences.length} field experience record(s)!`;
        };

        toast.promise(saveOperation(), {
            loading: 'Saving field experiences...',
            success: (msg) => msg,
            error: (err) => err.message || "An error occurred",
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleNext = () => navigate('/resume'); 
    
    if (fetchError) {
        return (<div className="card text-center" style={{padding: '40px', minHeight: '300px', backgroundColor: '#fee2e2', color: '#b91c1c'}}><h3 className="text-xl font-bold">Data Load Error</h3><p className="mt-2">{fetchError}</p><p className="mt-4 text-sm">Cannot proceed without essential dropdown data.</p></div>);
    }

    return (
        <div className="card"> 
            <div className="card-header"><h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> Field Experience Details</h2><p className="card-subtitle">Record your experience in different specialized field areas.</p></div>
            <form onSubmit={handleSubmit}>
                <div className="form-content-area">
                    {fieldExperiences.map((record, index) => (
                        <React.Fragment key={index}>
                            <FieldExperienceEntry index={index} record={record} onChange={(e) => handleChange(index, e)} onRemove={() => handleRemoveRecord(index)} canRemove={fieldExperiences.length > 1} fieldAreaOptions={fieldAreaOptions} isLoadingOptions={isLoadingOptions} />
                            {index < fieldExperiences.length - 1 && (<hr style={{margin: '20px 0', border: '0', borderTop: '1px dashed #e5e7eb'}} />)}
                        </React.Fragment>
                    ))}
                    <div style={{marginTop: '1rem'}}><button type="button" onClick={handleAddRecord} className="btn btn-secondary">+ Add Another Field Experience</button></div>
                </div>
                <div className="form-actions">
                    {isSaved ? (
                        <><button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting || isLoadingOptions || fetchError}>{isSubmitting ? 'Updating...' : 'Update Experiences'}</button><button type="button" onClick={handleNext} className="btn btn-primary" style={{ minWidth: '200px' }}>Next: Resume Upload &rarr;</button></>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting || isLoadingOptions || fetchError}>{isSubmitting ? 'Saving...' : `Save All Field Experiences (${fieldExperiences.length})`}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FieldExp;