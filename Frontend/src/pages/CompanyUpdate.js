// fileName: pages/CompanyUpdate.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function CompanyUpdate() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  
  // Define Backend URL for previews
  const API_BASE_URL = "http://localhost:5000";

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    companyDetails: '', 
    colourCode: '#ffffff'
  });
  
  // File State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  // 1. Fetch All Companies on Component Mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // ✅ UPDATED ROUTE: Changed from '/api/company/all' to global '/api/company'
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Could not load company list.");
    }
  };

  // 2. Handle Dropdown Selection
  const handleSelectCompany = (e) => {
    const id = e.target.value;
    setSelectedCompanyId(id);

    if (id) {
      const selected = companies.find(c => c.companyId === id);
      if (selected) {
        setFormData({
            companyName: selected.companyName,
            companyDetails: selected.companyDetails || '',
            colourCode: selected.colourCode || '#ffffff'
        });
        
        if (selected.logoPath) {
            const fullPath = selected.logoPath.startsWith('http') 
                ? selected.logoPath 
                : `${API_BASE_URL}${selected.logoPath}`;
            setLogoPreview(fullPath);
        } else {
            setLogoPreview(null);
        }

        setLogoFile(null);
      }
    } else {
        setFormData({ companyName: '', companyDetails: '', colourCode: '#ffffff' });
        setLogoPreview(null);
    }
  };

  // 3. Handle Text Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // 4. Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // 5. Submit Updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    setLoading(true);

    try {
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('companyDetails', formData.companyDetails);
      data.append('colourCode', formData.colourCode);
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const token = localStorage.getItem('authToken');
      
      // ✅ UPDATED ROUTE: Changed from '/api/company/update/{id}' to RESTful '/api/company/{id}'
      const response = await fetch(`/api/company/${encodeURIComponent(selectedCompanyId)}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Company updated successfully!");
        fetchCompanies();
      } else {
        toast.error(result.message || "Failed to update company.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '600px', margin: '30px auto' }}>
      <div className="card">
        <div className="card-header">
            <h2 className="card-title">Update Company</h2>
            <p className="card-subtitle">Edit company details and branding.</p>
        </div>

        <div className="form-content-area">
            <div className="form-group field" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Select Company to Edit</label>
                <select 
                    className="form-input" 
                    value={selectedCompanyId} 
                    onChange={handleSelectCompany}
                >
                    <option value="">-- Select a Company --</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.companyId}>
                            {c.companyName} ({c.companyId})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCompanyId && (
                <>
                    <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
                            
                            <div className="form-group field">
                                <label>Company ID (Cannot be changed)</label>
                                <input 
                                    type="text" 
                                    value={selectedCompanyId} 
                                    disabled 
                                    className="form-input" 
                                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="form-group field">
                                <label htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group field">
                                <label htmlFor="companyDetails">Company Description</label>
                                <textarea
                                    id="companyDetails"
                                    name="companyDetails"
                                    value={formData.companyDetails}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

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

                            <div className="form-group field">
                                <label>Company Logo</label>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginTop: '10px' }}>
                                    {logoPreview ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ 
                                                border: '1px solid #ddd', 
                                                borderRadius: '4px',
                                                padding: '4px',
                                                display: 'inline-block'
                                            }}>
                                                <img 
                                                    src={logoPreview} 
                                                    alt="Preview" 
                                                    style={{ 
                                                        maxHeight: '100px', 
                                                        maxWidth: '150px',
                                                        height: 'auto',
                                                        width: 'auto',
                                                        objectFit: 'contain',
                                                        display: 'block'
                                                    }} 
                                                />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Current / Preview</div>
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            width: '80px', height: '80px', 
                                            borderRadius: '4px', 
                                            backgroundColor: '#f3f4f6', 
                                            border: '1px dashed #ccc',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            color: '#9ca3af' 
                                        }}>
                                            No Logo
                                        </div>
                                    )}
                                    
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="form-input"
                                        />
                                        <small style={{ color: '#6b7280' }}>Upload to replace existing logo.</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
}

export default CompanyUpdate;