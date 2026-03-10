// fileName: SignUpPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast'; 

function SignUpPage() {
  const navigate = useNavigate();

  // ✅ Removed companyId from state
  const [formData, setFormData] = useState({
    icNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // IC Number Logic: only numbers and dashes, max 12 digits
    if (name === 'icNumber') {
      const cleanedValue = value.replace(/[^0-9-]/g, '');
      const maxLength = 12; 
      if (cleanedValue.length <= maxLength) {
          setFormData(prevState => ({ ...prevState, [name]: cleanedValue }));
      }
      return; 
    }
    
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // --- Validation ---
    const icPattern = /^\d{6}-?\d{2}-?\d{4}$/; 
    if (!icPattern.test(formData.icNumber.replace(/-/g, ''))) {
        toast.error("IC Number must be 12 digits (e.g., 900101015001)."); 
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
        toast.error("Please enter a valid email address.");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating your global account...");

    try {
      const payload = {
        icNumber: formData.icNumber,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      // ✅ GLOBAL ROUTE: Candidate registers without a company context
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Account created! Please log in with your Company Reference ID.");
        
        // Clear form
        setFormData({
          icNumber: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        // Redirect to login where they will provide the Company ID
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please check your connection."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '450px', margin: '50px auto' }}> 
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="card signup-card"> 
        <div className="card-header">
          <h2 className="card-title">Candidate Sign Up</h2> 
          <p className="card-subtitle">Create your profile. You will link to a company during login.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
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
                  required
                  disabled={loading}
                  className="form-input"
                  inputMode="numeric" 
                  placeholder="e.g., 900101015001"
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="form-input"
                  placeholder="e.g., candidate@example.com"
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  disabled={loading}
                  className="form-input"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="form-input"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#7c3aed', fontWeight: '600', textDecoration: 'none' }}>
                  Login
              </Link>
          </p>
      </div>
    </div>
  );
}

export default SignUpPage;