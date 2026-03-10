// fileName: ContactForm.js
import React, { useState, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Phone, Mail, AlertCircle, Home } from 'lucide-react';

const FormField = ({ label, children, fullWidth = false }) => (
    <div className={`field ${fullWidth ? 'full-width-field' : ''}`}>
        <label>{label}</label>
        {children}
    </div>
);

const ContactForm = () => {
    const navigate = useNavigate();
    
    const getTenantUrl = useCallback(() => {
        const storedCompanyId = localStorage.getItem('companyId');
        if (!storedCompanyId) return null;
        return `/api/companies/${encodeURIComponent(storedCompanyId)}/Contact`;
    }, []);

    const [formData, setFormData] = useState({
        correspondenceAddress: '',
        correspondencePhone: '',
        permanentAddress: '',
        permanentPhone: '',
        emergencyContactName: '',
        emergencyAddress: '',
        emergencyPhone: '',
        email: '',
        phoneNumber: '',
        officeNumber: '',
        otherNumber: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [candidateId, setCandidateId] = useState(null);
    const [fetchingData, setFetchingData] = useState(false);

    const fetchContactData = useCallback(async (id) => {
        const baseUrl = getTenantUrl();
        if (!baseUrl) {
            console.warn("No Company ID found in storage.");
            return;
        }

        setFetchingData(true);
        try {
            // GET request uses path: /api/.../Contact/CAND001
            const url = `${baseUrl}/${id}`;
            const response = await fetch(url);
            
            if (response.status === 404 || response.status === 204) return;
            if (!response.ok) throw new Error("Failed to load existing data");

            const data = await response.json();
            if (!data) return;

            const getValue = (key) => {
                if (data[key] !== undefined && data[key] !== null) return data[key];
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (data[pascalKey] !== undefined && data[pascalKey] !== null) return data[pascalKey];
                return '';
            };

            setFormData({
                correspondenceAddress: getValue('correspondenceAddress'),
                correspondencePhone: getValue('correspondencePhone'),
                permanentAddress: getValue('permanentAddress'),
                permanentPhone: getValue('permanentPhone'),
                emergencyContactName: getValue('emergencyContactName'),
                emergencyAddress: getValue('emergencyAddress'),
                emergencyPhone: getValue('emergencyPhone'),
                email: getValue('email'),
                phoneNumber: getValue('phoneNumber'),
                officeNumber: getValue('officeNumber'),
                otherNumber: getValue('otherNumber')
            });
            setIsSaved(true); 
        } catch (error) {
            console.error("Error loading contact data:", error);
        } finally {
            setFetchingData(false);
        }
    }, [getTenantUrl]); 

    useEffect(() => {
        const storedId = localStorage.getItem("candidateId");
        if (!storedId) {
            toast.error("No Candidate ID found. Please complete the Personal Information form first.");
        } else {
            setCandidateId(storedId);
            fetchContactData(storedId); 
        }
    }, [fetchContactData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isSaved) setIsSaved(false); 
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!candidateId) {
            toast.error("Cannot save: Missing Candidate ID.");
            return;
        }

        const baseUrl = getTenantUrl();
        if (!baseUrl) {
            toast.error("Session Error: Company ID missing. Please login again.");
            return;
        }

        if (!formData.email || !formData.correspondenceAddress || !formData.phoneNumber) {
            toast.error("Please fill in Email, Correspondence Address, and Personal Phone.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            ...formData,
            companyId: localStorage.getItem('companyId') 
        };

        const saveOperation = async () => {
            const url = `${baseUrl}?candidateId=${encodeURIComponent(candidateId)}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to save (Error ${response.status})`);
            }
            
            await response.json(); 
            
            setIsSaved(true); 
            return "Contact information saved successfully!";
        };

        toast.promise(saveOperation(), {
            loading: 'Saving contact details...',
            success: (msg) => msg,
            error: (err) => err.message || "An error occurred",
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleNext = () => navigate('/qualification'); 

    // Simplified helper to render address fields since correspondence and permanent layouts are now identical
    const renderAddressFields = (prefix, isRequired) => (
        <>
            <div className="grid">
                <FormField label={`Address ${isRequired ? '*' : ''}`} fullWidth>
                    <textarea 
                        name={`${prefix}Address`} 
                        value={formData[`${prefix}Address`]} 
                        onChange={handleChange} 
                        rows={3} 
                        placeholder="Enter your full address..." 
                        required={isRequired} 
                        className="form-input"
                    />
                </FormField>
            </div>
            <div className="grid">
                <FormField label="Phone">
                    <input type="tel" name={`${prefix}Phone`} value={formData[`${prefix}Phone`]} onChange={handleChange} placeholder="e.g., +6012-3456789" className="form-input" />
                </FormField>
                <div className="field"></div>
            </div>
        </>
    );

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">{fetchingData ? "Loading Contact Details..." : "Contact Information"}</h2>
                <p className="card-subtitle">Please fill in your contact details below</p>
            </div>
            {fetchingData && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading data...</div>}
            <form onSubmit={handleSubmit} style={{ opacity: fetchingData ? 0.5 : 1, pointerEvents: fetchingData ? 'none' : 'auto' }}>
                <div className="form-content-area">
                    <div className="form-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={18} /> Correspondence Details
                        </h3>
                        {renderAddressFields('correspondence', true)}
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Home size={18} /> Permanent Address
                        </h3>
                        {renderAddressFields('permanent', false)}
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} /> Emergency Contact
                        </h3>
                        <div className="grid">
                            <FormField label="Emergency Contact Name">
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency contact name" className="form-input" />
                            </FormField>
                            <FormField label="Phone Number">
                                <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Emergency phone" className="form-input" />
                            </FormField>
                        </div>
                        <div className="grid">
                            <FormField label="Address" fullWidth>
                                <input type="text" name="emergencyAddress" value={formData.emergencyAddress} onChange={handleChange} placeholder="Emergency contact's address" className="form-input" />
                            </FormField>
                        </div>
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #f3f4f6'}} />
                    <div className="form-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={18} /> General Contact Information
                        </h3>
                        <div className="grid">
                            <FormField label="Email Address *">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="form-input" />
                            </FormField>
                            <FormField label="Personal Phone *">
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+6012-3456789" required className="form-input" />
                            </FormField>
                        </div>
                        <div className="grid">
                            <FormField label="Office Number">
                                <input type="tel" name="officeNumber" value={formData.officeNumber} onChange={handleChange} placeholder="Office phone" className="form-input" />
                            </FormField>
                            <FormField label="Other Number">
                                <input type="tel" name="otherNumber" value={formData.otherNumber} onChange={handleChange} placeholder="Alternative phone" className="form-input" />
                            </FormField>
                        </div>
                    </div>
                </div>
                <div className="form-actions">
                    {isSaved ? (
                        <>
                            <button type="submit" disabled={isSubmitting} className="btn btn-secondary" style={{ marginRight: '10px' }}>
                                {isSubmitting ? 'Updating...' : 'Update Information'}
                            </button>
                            <button type="button" onClick={handleNext} className="btn btn-primary">
                                Next: Qualification Details &rarr;
                            </button>
                        </>
                    ) : (
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Saving...' : 'Save Contact Information'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ContactForm;