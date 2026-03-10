// fileName: HobbyLanguageForm.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Brush, Globe, Trash2 } from 'lucide-react'; 

const DROPDOWN_FETCH_CONFIG = [
    { name: 'hobbyCodeMap', tableName: 'hobby_codes', fallbackLabel: 'Hobby Code' },
    { name: 'languageCodeMap', tableName: 'language_codes', fallbackLabel: 'Language Code' },
];

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const abilityLevels = ['BASIC', 'INTERMEDIATE', 'FLUENT', 'NATIVE'];
const today = new Date().toISOString().substring(0, 10);

const initialHobbyState = { hobbyCode: '', localDescription: '', abilityLevel: '', hobbyName: '', entryDate: today };
const initialLanguageState = { entryDate: today, languageCode: '', readLevel: '', writtenLevel: '', spokenLevel: '', languageName: '' };

const HobbyEntry = ({ index, hobby, onChange, onRemove, canRemove, hobbyCodeMap, isLoading }) => {
    const defaultLabel = isLoading ? 'Loading...' : 'Select Hobby Code';
    const isDataReady = !isLoading && Object.keys(hobbyCodeMap).length > 1;
    return (
        <div className="form-section-entry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 className="text-md font-semibold text-gray-600">Hobby Entry #{index + 1}</h4>
                {canRemove && <button type="button" onClick={onRemove} className="btn btn-danger"><Trash2 size={16} style={{ marginRight: '4px' }} />Remove</button>}
            </div>
            <div className="grid"><FormField label="Hobby Code"><select name="hobbyCode" value={hobby.hobbyCode} onChange={onChange} className="form-input" disabled={!isDataReady}><option value="" disabled={isDataReady}>{defaultLabel}</option>{Object.entries(hobbyCodeMap).filter(([code]) => code !== '').map(([code, description]) => (<option key={code} value={code}>{description}</option>))}</select></FormField><FormField label="Hobby Name"><input type="text" name="hobbyName" value={hobby.hobbyName} placeholder="e.g., Coding, Photography" className="form-input" readOnly disabled/></FormField></div>
            <div className="grid"><FormField label="Ability Level"><select name="abilityLevel" value={hobby.abilityLevel} onChange={onChange} className="form-input"><option value="">Select Level...</option>{abilityLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></FormField><FormField label="Local Description"><input name="localDescription" value={hobby.localDescription} onChange={onChange} placeholder="Describe involvement" className="form-input"/></FormField></div>
            <div className="grid"><FormField label="Entry Date"><input type="date" name="entryDate" value={hobby.entryDate} readOnly className="form-input" disabled/></FormField><div className="field"></div></div>
        </div>
    );
};

const LanguageEntry = ({ index, language, onChange, onRemove, canRemove, languageCodeMap, isLoading }) => {
    const defaultLabel = isLoading ? 'Loading...' : 'Select Language Code';
    const isDataReady = !isLoading && Object.keys(languageCodeMap).length > 1;
    return (
        <div className="form-section-entry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 className="text-md font-semibold text-gray-600">Language Entry #{index + 1}</h4>
                {canRemove && <button type="button" onClick={onRemove} className="btn btn-danger"><Trash2 size={16} style={{ marginRight: '4px' }} />Remove</button>}
            </div>
            <div className="grid"><FormField label="Language Code"><select name="languageCode" value={language.languageCode} onChange={onChange} className="form-input" disabled={!isDataReady}><option value="" disabled={isDataReady}>{defaultLabel}</option>{Object.entries(languageCodeMap).filter(([code]) => code !== '').map(([code, description]) => (<option key={code} value={code}>{description}</option>))}</select></FormField><FormField label="Language Name"><input type="text" name="languageName" value={language.languageName} placeholder="e.g., Mandarin, Spanish" className="form-input" readOnly disabled/></FormField></div>
            <div className="grid"><FormField label="Reading Level"><select name="readLevel" value={language.readLevel} onChange={onChange} className="form-input"><option value="">Select Level...</option>{abilityLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></FormField><FormField label="Written Level"><select name="writtenLevel" value={language.writtenLevel} onChange={onChange} className="form-input"><option value="">Select Level...</option>{abilityLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></FormField></div>
            <div className="grid"><FormField label="Spoken Level"><select name="spokenLevel" value={language.spokenLevel} onChange={onChange} className="form-input"><option value="">Select Level...</option>{abilityLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></FormField><FormField label="Entry Date"><input type="date" name="entryDate" value={language.entryDate} readOnly className="form-input" disabled/></FormField></div>
        </div>
    );
};

const HobbyLanguageForm = () => {
    const navigate = useNavigate();

    const [dropdownOptions, setDropdownOptions] = useState({ hobbyCodeMap: { '': 'Select Hobby Code' }, languageCodeMap: { '': 'Select Language Code' } });
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [hobbies, setHobbies] = useState([initialHobbyState]);
    const [languages, setLanguages] = useState([initialLanguageState]);

    const [isSaved, setIsSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidateId, setCandidateId] = useState(null);

    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const fetchDropdowns = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        
        const baseUrl = getTenantUrl('AdminUpdate/options');
        if (!baseUrl) return;

        const fetchAndMap = async ({ name, tableName, fallbackLabel }) => {
            try {
                const response = await fetch(`${baseUrl}/${tableName}`);
                if (!response.ok) throw new Error(`Failed to fetch ${name}`);
                const data = await response.json(); 
                const resultMap = { '': `Select ${fallbackLabel}` };
                data.forEach(item => { resultMap[item.code] = item.description; });
                return { name, data: resultMap };
            } catch (error) {
                console.warn(`Could not load options for ${name}.`, error);
                return { name, data: { '': `Failed to load ${fallbackLabel}` } }; 
            }
        };

        const promises = DROPDOWN_FETCH_CONFIG.map(fetchAndMap);
        const results = await Promise.allSettled(promises);
        
        setDropdownOptions(currentOptions => {
            let finalOptions = { ...currentOptions };
            let hasError = false;
            results.forEach(result => {
                if (result.status === 'fulfilled') finalOptions[result.value.name] = result.value.data; 
                else hasError = true;
            });
            if (hasError) {
                setFetchError('One or more dropdown lists failed to load.');
                toast.error('Error loading essential dropdown data.');
            }
            return finalOptions;
        });
        setIsLoading(false); 
    }, [getTenantUrl]); 

    const fetchUserData = useCallback(async (id) => {
        if (!id) return;
        const baseUrl = getTenantUrl('HobbyLanguage');
        if (!baseUrl) return;

        try {
            const response = await fetch(`${baseUrl}/${id}`);
            if (response.ok) {
                const data = await response.json();
                const getValue = (obj, key) => {
                    if (!obj) return undefined;
                    return obj[key] || obj[key.charAt(0).toUpperCase() + key.slice(1)];
                };

                const hobbiesList = getValue(data, 'hobbies');
                const languagesList = getValue(data, 'languages');
                let dataLoaded = false;

                if (Array.isArray(hobbiesList) && hobbiesList.length > 0) {
                    const mappedHobbies = hobbiesList.map(h => ({
                        hobbyCode: getValue(h, 'hobbyCode') || '',
                        hobbyName: '', 
                        abilityLevel: getValue(h, 'abilityLevel') || '',
                        localDescription: getValue(h, 'localDescription') || '',
                        entryDate: (getValue(h, 'entryDate') || today).split('T')[0]
                    }));
                    setHobbies(mappedHobbies);
                    dataLoaded = true;
                }
                if (Array.isArray(languagesList) && languagesList.length > 0) {
                    const mappedLanguages = languagesList.map(l => ({
                        languageCode: getValue(l, 'languageCode') || '',
                        languageName: '',
                        readLevel: getValue(l, 'readLevel') || '',
                        writtenLevel: getValue(l, 'writtenLevel') || '',
                        spokenLevel: getValue(l, 'spokenLevel') || '',
                        entryDate: (getValue(l, 'entryDate') || today).split('T')[0]
                    }));
                    setLanguages(mappedLanguages);
                    dataLoaded = true;
                }
                
                if (dataLoaded) {
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error("Failed to load user data:", error);
        }
    }, [getTenantUrl]);

    useEffect(() => {
        const init = async () => {
            const storedId = localStorage.getItem("candidateId");
            if (!storedId) {
                toast.error("No Candidate ID found. Please ensure you are logged in.");
            } else {
                setCandidateId(storedId);
                await fetchDropdowns();
                await fetchUserData(storedId);
            }
        };
        init();
    }, [fetchDropdowns, fetchUserData]); 

    useEffect(() => {
        if (Object.keys(dropdownOptions.hobbyCodeMap).length > 1) {
            setHobbies(prev => prev.map(h => ({ ...h, hobbyName: dropdownOptions.hobbyCodeMap[h.hobbyCode] || '' })));
        }
        if (Object.keys(dropdownOptions.languageCodeMap).length > 1) {
            setLanguages(prev => prev.map(l => ({ ...l, languageName: dropdownOptions.languageCodeMap[l.languageCode] || '' })));
        }
    }, [dropdownOptions, isSaved]); 

    const handleStateChange = (setter, newState) => {
        if (isSaved) setIsSaved(false);
        setter(newState);
    }

    const handleMultiEntryChange = useCallback((index, e, setData, dataArray, type) => {
        const { name, value } = e.target;
        let extraUpdates = {};
        if (isSaved) setIsSaved(false);
        if (type === 'hobby' && name === 'hobbyCode') {
            const newHobbyName = dropdownOptions.hobbyCodeMap[value] || '';
            extraUpdates = { hobbyName: newHobbyName };
        }
        if (type === 'language' && name === 'languageCode') {
            const newLanguageName = dropdownOptions.languageCodeMap[value] || '';
            extraUpdates = { languageName: newLanguageName };
        }
        const newArray = dataArray.map((item, i) => i === index ? { ...item, [name]: value, ...extraUpdates } : item);
        setData(newArray);
    }, [isSaved, dropdownOptions]); 

    const handleAddHobby = () => { handleStateChange(setHobbies, prev => [...prev, {...initialHobbyState, entryDate: today}]); toast.success('New hobby entry added!'); };
    const handleRemoveHobby = (index) => { if (hobbies.length > 1) { handleStateChange(setHobbies, prev => prev.filter((_, i) => i !== index)); toast.error('Hobby entry removed.'); } else { toast.error('You must have at least one hobby entry.'); } };
    const handleAddLanguage = () => { handleStateChange(setLanguages, prev => [...prev, {...initialLanguageState, entryDate: today}]); toast.success('New language entry added!'); };
    const handleRemoveLanguage = (index) => { if (languages.length > 1) { handleStateChange(setLanguages, prev => prev.filter((_, i) => i !== index)); toast.error('Language entry removed.'); } else { toast.error('You must have at least one language entry.'); } };
    
    const handleNext = () => navigate('/field-experience'); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const baseUrl = getTenantUrl('HobbyLanguage');
        const storedCompanyId = localStorage.getItem('companyId');

        if (!candidateId || !baseUrl) {
             toast.error("Required session information is missing.");
             return;
        }

        const uniqueHobbies = new Set();
        const uniqueLanguages = new Set();
        for (const h of hobbies) {
            if (h.hobbyCode) {
                if (uniqueHobbies.has(h.hobbyCode)) { toast.error("Duplicate detected! You cannot select the same Hobby multiple times."); return; }
                uniqueHobbies.add(h.hobbyCode);
            }
        }
        for (const l of languages) {
            if (l.languageCode) {
                if (uniqueLanguages.has(l.languageCode)) { toast.error("Duplicate detected! You cannot select the same Language multiple times."); return; }
                uniqueLanguages.add(l.languageCode);
            }
        }

        setIsSubmitting(true);

        const formData = new FormData();
        // ✅ FIX: Do NOT send candidateId in body
        formData.append('companyId', storedCompanyId); 
        formData.append('hobbiesJson', JSON.stringify(hobbies));
        formData.append('languagesJson', JSON.stringify(languages));
        
        const saveOperation = async () => {
            // ✅ FIX: Send candidateId via Query String
            const url = `${baseUrl}/save-details?candidateId=${encodeURIComponent(candidateId)}`;
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData, 
            });

            if (!response.ok) {
                let errorMsg = "Failed to save data.";
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = errorData.message;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            setIsSaved(true);
            return "Successfully saved Hobbies & Languages!";
        };

        toast.promise(saveOperation(), {
            loading: 'Saving details...',
            success: (msg) => msg,
            error: (err) => err.message || "An error occurred",
        }).finally(() => {
            setIsSubmitting(false);
        });
    };
    
    if (fetchError) {
        return (
            <div className="card text-center" style={{padding: '40px', minHeight: '300px', backgroundColor: '#fee2e2', color: '#b91c1c'}}>
                <h3 className="text-xl font-bold">Data Load Error</h3><p className="mt-2">{fetchError}</p><p className="mt-4 text-sm">Cannot proceed without essential dropdown data.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header"><h2 className="card-title">Hobby & Language Skills</h2><p className="card-subtitle">Complete your profile with details on your interests and communication skills.</p></div>
            <form onSubmit={handleSubmit}>
                <div className="form-content-area">
                    <div className="form-section"><h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Brush size={18} /> Hobby Details</h3>{hobbies.map((hobby, index) => (<React.Fragment key={`hobby-${index}`}><HobbyEntry index={index} hobby={hobby} hobbyCodeMap={dropdownOptions.hobbyCodeMap} onChange={(e) => handleMultiEntryChange(index, e, setHobbies, hobbies, 'hobby')} onRemove={() => handleRemoveHobby(index)} canRemove={hobbies.length > 1} isLoading={isLoading} />{index < hobbies.length - 1 && (<hr style={{margin: '20px 0', border: '0', borderTop: '1px dashed #e5e7eb'}} />)}</React.Fragment>))}<div style={{marginTop: '1rem'}}><button type="button" onClick={handleAddHobby} className="btn btn-secondary" disabled={isSubmitting}>+ Add Another Hobby</button></div></div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section"><h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> Language Skills</h3>{languages.map((language, index) => (<React.Fragment key={`lang-${index}`}><LanguageEntry index={index} language={language} languageCodeMap={dropdownOptions.languageCodeMap} onChange={(e) => handleMultiEntryChange(index, e, setLanguages, languages, 'language')} onRemove={() => handleRemoveLanguage(index)} canRemove={languages.length > 1} isLoading={isLoading} />{index < languages.length - 1 && (<hr style={{margin: '20px 0', border: '0', borderTop: '1px dashed #e5e7eb'}} />)}</React.Fragment>))}<div style={{marginTop: '1rem'}}><button type="button" onClick={handleAddLanguage} className="btn btn-secondary" disabled={isSubmitting}>+ Add Another Language</button></div></div>
                </div>
                <div className="form-actions">
                    {isSaved ? (
                        <><button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting || isLoading || fetchError}>{isSubmitting ? 'Updating...' : 'Update Details'}</button><button type="button" onClick={handleNext} className="btn btn-primary" style={{ minWidth: '200px' }}>Next: Field Experience &rarr;</button></>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting || isLoading || fetchError}>{isSubmitting ? 'Saving...' : 'Submit Details'}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default HobbyLanguageForm;