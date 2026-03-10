// fileName: pages/ResumeForm.js
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FileUp, Trash2 } from 'lucide-react';

const today = new Date().toISOString().substring(0, 10);
const initialResumeState = { resumeFile: null, fileName: '', entryDate: today };

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const ResumeForm = () => {
    const navigate = useNavigate();
    const [resumeData, setResumeData] = useState(initialResumeState);
    const [isSaved, setIsSaved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [candidateId, setCandidateId] = useState(null);

    const getTenantUrl = useCallback((controller) => {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return null;
        return `/api/companies/${encodeURIComponent(companyId)}/${controller}`;
    }, []);

    const fetchResumeData = useCallback(async (id) => {
        if (!id) return;
        const baseUrl = getTenantUrl('HobbyLanguage');
        if (!baseUrl) return;

        try {
            const url = `${baseUrl}/${id}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                
                const getValue = (obj, key) => {
                    if (!obj) return undefined;
                    return obj[key] || obj[key.charAt(0).toUpperCase() + key.slice(1)];
                };

                const resumeInfo = getValue(data, 'resume');
                if (resumeInfo) {
                    setResumeData({
                        resumeFile: null,
                        fileName: getValue(resumeInfo, 'fileName') || '',
                        entryDate: (getValue(resumeInfo, 'entryDate') || today).split('T')[0]
                    });
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error("Failed to load resume:", error);
        }
    }, [getTenantUrl]);

    useEffect(() => {
        const storedId = localStorage.getItem("candidateId");
        if (!storedId) {
            toast.error("No Candidate ID found.");
        } else {
            setCandidateId(storedId);
            fetchResumeData(storedId);
        }
    }, [fetchResumeData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0] || null;
        if (isSaved) setIsSaved(false);
        setResumeData(prev => ({ 
            ...prev, 
            resumeFile: file, 
            fileName: file ? file.name : '', 
            entryDate: today 
        }));
    };

    const handleRemoveFile = () => {
        const fileInput = document.getElementById('resume-upload-input');
        if (fileInput) fileInput.value = '';
        setIsSaved(false);
        setResumeData(initialResumeState);
        toast.error('File selection cleared. Please upload a new one.');
    };

    const handleNext = () => navigate('/review');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const baseUrl = getTenantUrl('HobbyLanguage');
        const storedCompanyId = localStorage.getItem('companyId');

        if (!candidateId || !baseUrl) {
            return toast.error("Required session information is missing.");
        }
        
        if (!resumeData.resumeFile) {
            return toast.error("Please select a file to upload.");
        }

        setIsSubmitting(true);

        const formData = new FormData();
        // ✅ FIX: Do NOT send candidateId in body
        formData.append('companyId', storedCompanyId);
        formData.append('resumeFile', resumeData.resumeFile);
        formData.append('resumeEntryDate', resumeData.entryDate);

        const saveOperation = async () => {
            // ✅ FIX: Send candidateId via Query String
            const url = `${baseUrl}/upload-resume?candidateId=${encodeURIComponent(candidateId)}`;
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = "Failed to upload.";
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = errorData.message;
                } catch {}
                throw new Error(errorMsg);
            }
            setIsSaved(true);
            return "Resume uploaded successfully!";
        };

        toast.promise(saveOperation(), {
            loading: 'Uploading...',
            success: (msg) => msg,
            error: (err) => err.message,
        }).finally(() => setIsSubmitting(false));
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Resume Upload</h2>
                <p className="card-subtitle">Upload your CV or Resume document.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-content-area">
                    <div className="form-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileUp size={18} /> Resume Details
                        </h3>
                        <div className="grid">
                            <FormField label="Upload Resume (PDF/DOCX)" fullWidth>
                                <input 
                                    type="file" 
                                    name="resumeFile" 
                                    id="resume-upload-input" 
                                    onChange={handleFileChange} 
                                    accept=".pdf,.doc,.docx" 
                                    className="form-input" 
                                />
                                {(resumeData.resumeFile || resumeData.fileName) && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', background: '#f0f9ff', padding: '8px', borderRadius: '6px' }}>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
                                            Current File: <strong>{resumeData.resumeFile ? resumeData.resumeFile.name : resumeData.fileName}</strong>
                                            {!resumeData.resumeFile && <span style={{ color: 'green', marginLeft: '8px', fontWeight: 'bold' }}>(Saved)</span>}
                                        </p>
                                        <button type="button" onClick={handleRemoveFile} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} disabled={isSubmitting}>
                                            <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear
                                        </button>
                                    </div>
                                )}
                            </FormField>
                        </div>
                        <div className="grid">
                            <FormField label="Entry Date">
                                <div style={{position: 'relative'}}>
                                    <input type="date" name="entryDate" value={resumeData.entryDate} readOnly className="form-input" disabled />
                                </div>
                            </FormField>
                            <div className="field"></div>
                        </div>
                    </div>
                </div>
                <div className="form-actions">
                    {isSaved ? (
                        <>
                            <button type="submit" className="btn btn-secondary" style={{ marginRight: '10px' }} disabled={isSubmitting}>
                                {isSubmitting ? 'Uploading...' : 'Re-upload Resume'}
                            </button>
                            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ minWidth: '200px' }}>
                                Next: Review Page &rarr;
                            </button>
                        </>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : 'Upload Resume'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ResumeForm;