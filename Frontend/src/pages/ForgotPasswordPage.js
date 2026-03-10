// fileName: ForgotPasswordPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast'; 

function ForgotPasswordPage() {
  const navigate = useNavigate();

  // State to hold form data (Removed companyId and email for global candidate reset)
  const [formData, setFormData] = useState({
    icNumber: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Specific logic for IC Number (only digits and dashes)
    if (name === 'icNumber') {
        const cleanedValue = value.replace(/[^0-9-]/g, '');
        const maxLength = 12;
        if (cleanedValue.length <= maxLength) {
            setFormData(prevState => ({ ...prevState, [name]: cleanedValue }));
        }
        return;
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 1. Validate Empty Fields First ---
    if (!formData.icNumber || !formData.newPassword || !formData.confirmNewPassword) {
        toast.error("All fields are required.");
        return;
    }

    // --- 2. Validate IC Format ---
    const icPattern = /^\d{6}-?\d{2}-?\d{4}$/; 
    if (!icPattern.test(formData.icNumber.replace(/-/g, ''))) {
        toast.error("IC Number must be 12 digits.");
        return;
    }

    // --- 3. Validate Password Match ---
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    // --- 4. Validate Password Length ---
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying details...");

    try {
      const payload = {
        icNumber: formData.icNumber,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      };

      // ✅ UPDATED ROUTE: Global auth route for candidates
      const response = await fetch(`/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Password reset successfully! Redirecting...");
        
        // Redirect to Login Page after short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        
        // --- IMPROVED ERROR HANDLING ---
        let errorMsg = data.message || "Failed to reset password.";
        if (data.errors) {
            const errorValues = Object.values(data.errors).flat();
            if (errorValues.length > 0) {
                errorMsg = errorValues[0];
            }
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '450px', margin: '50px auto' }}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="card"> 
        <div className="card-header">
          <h2 className="card-title">Candidate Password Reset</h2> 
          <p className="card-subtitle">
            Enter your IC Number to reset your global account password.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-content-area">
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}> 

              <div className="form-group field"> 
                <label htmlFor="icNumber">IC Number</label>
                <input
                  type="text"
                  id="icNumber"
                  name="icNumber"
                  value={formData.icNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 900101015001"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="At least 8 characters"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Re-enter new password"
                  disabled={loading}
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'none' }}>
                &larr; Back to Login
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;