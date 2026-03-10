// fileName: ChangePassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating administrator security...");

    try {
      // ✅ Admin identification uses UserId, not CandidateId
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');

      if (!userId || !token) {
          toast.error("Session expired. Please log in again.");
          setLoading(false);
          toast.dismiss(loadingToast);
          return;
      }

      const payload = {
        userId: userId, 
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      };

      // ✅ TARGET: Global Route (ignores company prefix)
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Admin password updated!");
        
        // Redirect based on Admin Role
        setTimeout(() => {
            const role = localStorage.getItem('userRole');
            if(role === 'superadmin') navigate('/create-company');
            else navigate('/candidates'); 
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Failed to update password.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '450px', margin: '50px auto' }}>
      <Toaster position="top-center" />
      <div className="card"> 
        <div className="card-header">
          <h2 className="card-title">Admin Security Update</h2> 
          <p className="card-subtitle">Please set a permanent password for your administrative account.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-content-area">
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}> 
              <div className="field"> 
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required className="form-input" disabled={loading} />
              </div>
              <div className="field"> 
                <label>New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required className="form-input" disabled={loading} />
              </div>
              <div className="field"> 
                <label>Confirm New Password</label>
                <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} required className="form-input" disabled={loading} />
              </div>
            </div>
          </div>
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;