// fileName: SkillForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast'; 
import { Terminal, Lightbulb, BookOpen } from 'lucide-react'; 

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const flexGrowStyle = { flex: 1 };

const initialSkill = {
    officeSkill: '',
    otherSkill: '',
    otherInfo: '',
};

const SkillForm = () => {
    const navigate = useNavigate(); 
    const [skill, setSkill] = useState(initialSkill);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [candidateId, setCandidateId] = useState(null);

    const getTenantUrl = useCallback(() => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/Skill`;
    }, []);

    const fetchSkillData = useCallback(async (id) => {
        const baseUrl = getTenantUrl();
        if (!baseUrl) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = `${baseUrl}/${id}`;
            const response = await fetch(url);
            
            if (response.status === 404 || response.status === 204) return; 
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    const getValue = (key) => {
                        if (data[key] !== undefined && data[key] !== null) return data[key];
                        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                        if (data[pascalKey] !== undefined && data[pascalKey] !== null) return data[pascalKey];
                        return '';
                    };
                    setSkill({
                        officeSkill: getValue('officeSkills'),
                        otherSkill: getValue('otherRelevantSkills'),
                        otherInfo: getValue('otherSkillInformation')
                    });
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error("Error loading skill data:", error);
        } finally {
            setLoading(false);
        }
    }, [getTenantUrl]);

    useEffect(() => {
        const storedId = localStorage.getItem("candidateId");
        if (!storedId) {
            toast.error("No Candidate ID found. Please ensure you are logged in.");
            setLoading(false);
        } else {
            setCandidateId(storedId);
            fetchSkillData(storedId);
        }
    }, [fetchSkillData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isSaved) setIsSaved(false);
        setSkill(prevSkill => ({ ...prevSkill, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const baseUrl = getTenantUrl();
        const storedCompanyId = localStorage.getItem('companyId');

        if (!candidateId || !baseUrl) {
            toast.error("Required session information is missing.");
            return;
        }

        setIsSubmitting(true);

        // ✅ FIX: Do NOT include candidateId in the body to avoid Guid conversion errors
        const payload = {
            companyId: storedCompanyId, 
            officeSkills: skill.officeSkill,
            otherRelevantSkills: skill.otherSkill,
            otherSkillInformation: skill.otherInfo
        };

        const saveOperation = async () => {
            // ✅ FIX: Send candidateId as a Query Parameter
            const url = `${baseUrl}?candidateId=${encodeURIComponent(candidateId)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to save skill details.");
            }
            setIsSaved(true);
            return "Successfully saved skill details!";
        };

        toast.promise(saveOperation(), {
            loading: 'Saving skill details...',
            success: (msg) => msg,
            error: (err) => err.message || "An error occurred",
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleNext = () => navigate('/hobby-language');

    return (
        <div className="card">
            <div className="card-header"><h2 className="card-title">Skill Details 💡</h2><p className="card-subtitle">{loading ? "Loading skills..." : "List technical, office, and other relevant skills."}</p></div>
            {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading data...</div>}
            <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                <div className="form-content-area">
                    <div className="form-section p-4 mb-6 border border-gray-200 rounded-lg shadow-sm" style={{ border: '1px solid #d1d5db' }}>
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Candidate Skills</h3>
                        <div className="sub-form-section">
                            <FormField label="Office Skills" fullWidth><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Terminal className="text-gray-500" size={18} /><input type="text" name="officeSkill" value={skill.officeSkill} onChange={handleChange} placeholder="e.g., MS Office, SAP" className="form-input" style={flexGrowStyle}/></div></FormField>
                            <FormField label="Other Relevant Skills" fullWidth><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb className="text-gray-500" size={18} /><input type="text" name="otherSkill" value={skill.otherSkill} onChange={handleChange} placeholder="e.g., Mandarin, Project Management" className="form-input" style={flexGrowStyle}/></div></FormField>
                            <FormField label="Other Information/Notes" fullWidth><div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><BookOpen className="text-gray-500 mt-2" size={18} /><textarea name="otherInfo" value={skill.otherInfo} onChange={handleChange} rows="3" placeholder="Certifications or additional notes..." className="form-input" style={flexGrowStyle}/></div></FormField>
                        </div>
                    </div>
                </div>
                <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                    {isSaved ? (
                        <>
                            <button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Skills'}</button>
                            <button type="button" onClick={handleNext} className="btn btn-primary">Next: Hobby & Language &rarr;</button>
                        </>
                    ) : (
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Skills'}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SkillForm;