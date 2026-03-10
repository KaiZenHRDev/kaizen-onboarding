// fileName: pages/CreateAdminPage.js
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function CreateAdminPage() {
    // 1. STATE HOOKS (Restored)
    const [formData, setFormData] = useState({
        companyId: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // ✅ Restored

    // 2. INPUT HANDLER (Restored)
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Optional: trim whitespace for ID and Email automatically
        const finalValue = (name === 'companyId' || name === 'email') ? value.trim() : value;
        
        setFormData(prevState => ({ ...prevState, [name]: finalValue }));
    };

    // 3. SUBMISSION WITH PRE-CREATION CHECKS
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- LAYER A: FRONTEND DATA VALIDATION ---
        if (!formData.companyId || formData.companyId.length < 3) {
            toast.error("Company ID is too short.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            toast.error("Please enter a valid email format.");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Performing pre-creation checks...");

        try {
            const token = localStorage.getItem('authToken');

            // --- LAYER B: VERIFY COMPANY EXISTS ---
            // This prevents creating an admin for a non-existent company
            const checkResponse = await fetch(`/api/company/${encodeURIComponent(formData.companyId)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!checkResponse.ok) {
                toast.dismiss(loadingToast);
                if (checkResponse.status === 404) {
                    toast.error(`Company '${formData.companyId}' not found. Register the company first.`);
                } else {
                    toast.error("Could not verify company details.");
                }
                setLoading(false);
                return;
            }

            // --- LAYER C: ATTEMPT CREATION ---
            const response = await fetch(`/api/companies/${encodeURIComponent(formData.companyId)}/auth/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();
            let data = {};
            if (text) {
                try { data = JSON.parse(text); } catch (e) { }
            }

            toast.dismiss(loadingToast);

            if (response.status === 403) {
                toast.error("Access Denied: You do not have SuperAdmin permissions.");
            } else if (response.ok) {
                toast.success(data.message || "Admin account verified and created!");
                setFormData({ companyId: '', email: '', password: '' }); // Clear data on success
            } else {
                // Display specific error (e.g. "Email already assigned")
                toast.error(data.message || "Validation failed during creation.");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 4. HELPER UI COMPONENTS
    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const EyeSlashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );

    const toggleBtnStyle = {
        background: 'none', border: 'none', position: 'absolute', right: '10px', top: '38px', cursor: 'pointer', color: '#6b7280'
    };

    return (
        <div className="auth-form-wrapper" style={{ maxWidth: '500px', margin: '50px auto' }}>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Create Admin</h2>
                    <p className="card-subtitle">Register a new administrator linked to a Company ID.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-content-area">
                        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                            <div className="form-group field">
                                <label htmlFor="companyId">Company ID</label>
                                <input type="text" id="companyId" name="companyId" value={formData.companyId} onChange={handleChange} className="form-input" placeholder="Enter Company ID" />
                                <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>Admin will manage employees under this ID.</small>
                            </div>
                            <div className="form-group field">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="admin@company.com" />
                            </div>
                            <div className="form-group field" style={{ position: 'relative' }}>
                                <label htmlFor="password">Password</label>
                                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="Min. 8 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={toggleBtnStyle} tabIndex="-1">
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Processing...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateAdminPage;