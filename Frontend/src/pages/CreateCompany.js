// fileName: pages/CreateCompany.js
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function CreateCompany() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.0.55:8084";

  // State for form fields
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    companyDetails: '', 
    colourCode: '#ffffff',
  });
  
  // State for file upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // State for UI
  const [loading, setLoading] = useState(false);

  // Helper: Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Helper: File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, etc).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large. Max 2MB.');
        return;
      }

      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyId || !formData.companyName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('companyId', formData.companyId);
      data.append('companyName', formData.companyName);
      data.append('companyDetails', formData.companyDetails); 
      data.append('colourCode', formData.colourCode); 
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const token = localStorage.getItem('authToken');

      // Use the absolute URL mapped to your environment
      const response = await fetch(`${API_BASE_URL}/api/company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Company created successfully!");
        setFormData({ 
            companyId: '', 
            companyName: '', 
            companyDetails: '', 
            colourCode: '#ffffff' 
        });
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        toast.error(result.message || "Failed to create Company.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '500px', margin: '50px auto' }}>
      
      <div className="card">
        <div className="card-header">
            <h2 className="card-title">Register Company</h2>
            <p className="card-subtitle">Create a new company entity for the system.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-content-area">
            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
            
              {/* Company ID */}
              <div className="form-group field">
                <label htmlFor="companyId">Company ID (Used for Admin Login)</label>
                <input
                  type="text"
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., COMP-001 or 123456-X"
                  required
                />
                <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  This ID will be used as the "IC Number/Username" for the company Admin.
                </small>
              </div>

              {/* Company Name */}
              <div className="form-group field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Acme Corp Sdn Bhd"
                  required
                />
              </div>

              {/* Company Description */}
              <div className="form-group field">
                <label htmlFor="companyDetails">Company Description</label>
                <input
                  type="text"
                  id="companyDetails"
                  name="companyDetails"
                  value={formData.companyDetails}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Human Resources Management System"
                />
              </div>

              {/* Colour Code Picker */}
              <div className="form-group field">
                <label htmlFor="colourCode">Company Theme Colour</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="color"
                        id="colourCodePicker"
                        name="colourCode"
                        value={formData.colourCode}
                        onChange={handleChange}
                        style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                    />
                    <input
                        type="text"
                        id="colourCode"
                        name="colourCode"
                        value={formData.colourCode}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="#FFFFFF"
                        style={{ flex: 1 }}
                    />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="form-group field">
                <label htmlFor="logo">Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginTop: '5px' }}>
                    {logoPreview && (
                        <div style={{ flexShrink: 0 }}>
                            <img 
                                src={logoPreview} 
                                alt="Preview" 
                                style={{ 
                                    maxHeight: '60px', 
                                    maxWidth: '120px',
                                    height: 'auto',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    display: 'block'
                                }} 
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-input"
                        style={{ padding: '8px' }}
                    />
                </div>
              </div>

            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCompany;