// fileName: LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast, Toaster } from 'react-hot-toast';

function LoginPage() {
  const navigate = useNavigate(); 

  const [companyId, setCompanyId] = useState(''); 
  const [icNumber, setIcNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // Position State
  const [positions, setPositions] = useState([]); 
  const [selectedPosition, setSelectedPosition] = useState('');
  const [isFetchingPositions, setIsFetchingPositions] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleIcNumberChange = (e) => {
    const { value } = e.target;
    // Allow only numbers and dashes for IC
    const cleanedValue = value.replace(/[^0-9-]/g, '');
    if (cleanedValue.length <= 12) setIcNumber(cleanedValue);
  };

  /**
   * Fetches positions available for the specific company entered.
   */
  const handleCompanyIdBlur = async () => {
    const trimmedId = companyId.trim();
    if (!trimmedId) {
        setPositions([]);
        setSelectedPosition('');
        return;
    }

    setIsFetchingPositions(true);
    
    const checkPromise = (async () => {
        // 1. Verify Company Exists (Global Route)
        const companyCheck = await fetch(`/api/company/${encodeURIComponent(trimmedId)}`);
        if (!companyCheck.ok) {
            setPositions([]);
            setSelectedPosition('');
            throw new Error("Invalid Company Reference ID");
        }

        // ✅ FIXED: Use the hierarchical ROUTE-BASED format to match AdminUpdateController.cs
        // Pattern: /api/companies/{companyId}/AdminUpdate/options/{tableName}
        const posResponse = await fetch(`/api/companies/${encodeURIComponent(trimmedId)}/AdminUpdate/options/position_codes`, {
            headers: {
                'Content-Type': 'application/json'
                // Removed 'Company-Id' header as it's now in the URL path
            }
        });
        
        if (posResponse.ok) {
            const data = await posResponse.json();
            if (data && data.length > 0) {
                setPositions(data);
                return "Company verified";
            } else {
                setPositions([]);
                throw new Error("This company currently has no open positions.");
            }
        } else {
            setPositions([]);
            throw new Error("Failed to load company requirements.");
        }
    })();

    toast.promise(checkPromise, {
        loading: 'Verifying Company...',
        success: (msg) => msg,
        error: (err) => `${err.message}`
    });

    try { 
        await checkPromise; 
    } catch (e) {
        console.error("Company verification failed:", e);
    } finally { 
        setIsFetchingPositions(false); 
    }
  };

  /**
   * Login handles the assignment of the Global User to the Tenant database.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    // Validation
    const icPattern = /^\d{6}-?\d{2}-?\d{4}$/; 
    if (!icPattern.test(icNumber.replace(/-/g, ''))) {
        toast.error("IC Number must be 12 digits.");
        return;
    }

    if (!selectedPosition) {
        toast.error("Please select the position you are applying for.");
        return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Authenticating...");

    try {
      localStorage.clear();

      const trimmedCid = companyId.trim();
      const payload = {
        companyId: trimmedCid, 
        icNumber: icNumber,
        password: password,
        positionCode: selectedPosition 
      };

      // ✅ Login route remains tenant-prefixed in AuthController.cs
      const loginResponse = await fetch(`/api/companies/${encodeURIComponent(trimmedCid)}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await loginResponse.json();

      if (loginResponse.ok) {
        toast.dismiss(loadingToast);
        toast.success("Login successful!");

        localStorage.setItem('userId', data.userId || data.UserId);
        localStorage.setItem('candidateId', data.candidateId);
        localStorage.setItem('companyId', trimmedCid); 
        localStorage.setItem('userRole', (data.role || "candidate").toLowerCase());
        localStorage.setItem('userPositionCode', selectedPosition); 
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }

        const userRole = (data.role || "").toLowerCase();

        if (userRole === 'admin' || userRole === 'superadmin') {
            navigate(userRole === 'superadmin' ? '/admin-list' : '/candidates');
        } else {
            navigate('/candidates/new'); 
        }

      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || "Invalid IC Number or Password.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper" style={{ maxWidth: '450px', margin: '50px auto' }}> 
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="card login-card"> 
        <div className="card-header">
          <h2 className="card-title">Candidate Login</h2> 
          <p className="card-subtitle">Sign in to your application dashboard.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-content-area">
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}> 
              
              <div className="form-group field"> 
                <label htmlFor="companyId">Company Reference ID</label>
                <input
                  type="text" id="companyId" value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)} 
                  onBlur={handleCompanyIdBlur} 
                  required disabled={loading} className="form-input"
                  placeholder="e.g., COMP-001"
                  autoComplete="off"
                />
              </div>

              <div className="form-group field">
                <label htmlFor="positionCode">Position Applied For</label>
                <select
                    id="positionCode" value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="form-input"
                    disabled={loading || isFetchingPositions || positions.length === 0}
                    style={{ appearance: 'auto' }}
                    required
                >
                    <option value="">
                        {isFetchingPositions ? "Checking Company positions..." : 
                         positions.length === 0 ? "-- Enter Company ID First --" : "-- Select Position --"}
                    </option>
                    {positions.map((pos) => (
                        <option key={pos.code} value={pos.code}>
                            {pos.description || pos.name}
                        </option>
                    ))}
                </select>
              </div>

              <div className="form-group field"> 
                <label htmlFor="icNumber">IC Number</label>
                <input
                  type="text" id="icNumber" value={icNumber}
                  onChange={handleIcNumberChange} 
                  required disabled={loading} className="form-input"
                  placeholder="900101015001"
                />
              </div>

              <div className="form-group field"> 
                <label htmlFor="password">Password</label>
                <input
                  type="password" id="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required disabled={loading} className="form-input"
                />
              </div>
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--theme-primary)', textDecoration: 'none' }}>
                    Forgot Password?
                </Link>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || isFetchingPositions}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>
              Don't have a global profile?{' '}
              <Link to="/signup" style={{ color: 'var(--theme-primary)', fontWeight: '600', textDecoration: 'none' }}>
                  Sign Up
              </Link>
          </p>
      </div>
    </div>
  );
}

export default LoginPage;