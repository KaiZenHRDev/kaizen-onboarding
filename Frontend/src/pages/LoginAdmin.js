// fileName: pages/LoginAdmin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast, Toaster } from 'react-hot-toast'; 

function LoginAdmin() {
  const navigate = useNavigate(); 

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (!email.includes('@')) {
        toast.error("Please enter a valid email address.");
        return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      // Clear old session
      localStorage.clear();
      
      const payload = { email, password };

      // ✅ GLOBAL AUTH ROUTE: Used to identify the tenant and establish session
      const response = await fetch('/api/auth/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);

        // ✅ STORE TENANT CONTEXT: Essential for path-based routing in other pages
        localStorage.setItem('userId', data.userId || '');
        localStorage.setItem('authToken', data.token || '');
        
        const role = (data.role || 'Admin').toLowerCase();
        localStorage.setItem('userRole', role);
        
        if (data.companyId) {
            localStorage.setItem('companyId', data.companyId);
        }

        // Navigate based on account status and role
        if (data.isFirstLogin) {
            navigate('/change-password'); 
        } else if (role === 'superadmin') {
            navigate('/create-company'); 
        } else {
            navigate('/candidates'); 
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '450px', margin: '50px auto' }}> 
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="card login-card"> 
        <div className="card-header">
          <h2 className="card-title">Admin Login</h2> 
          <p className="card-subtitle">Sign in using your administrative email.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-content-area">
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}> 
              <div className="form-group field"> 
                <label htmlFor="email">Email Address</label>
                <input 
                    type="email" 
                    name="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="form-input" 
                    placeholder="admin@company.com" 
                    disabled={loading} 
                />
              </div>
              <div className="form-group field"> 
                <label htmlFor="password">Password</label>
                <input 
                    type="password" 
                    name="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="form-input" 
                    disabled={loading} 
                />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                {/* ✅ UPDATED LINK: Points to the admin forgot password route */}
                <Link to="/admin-forgot-password" style={{ fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          </div>
          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>
            Not an admin? <Link to="/login" style={{ color: '#7c3aed', fontWeight: '600', textDecoration: 'none' }}>Candidate Login</Link>
          </p>
      </div>
    </div>
  );
}

export default LoginAdmin;