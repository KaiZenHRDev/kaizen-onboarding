// fileName: src/pages/ThanksAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Monitor, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ✅ FIXED: Using PascalCase to match the C# model
const RECRUITMENT_DEFAULTS = {
  ThanksTitle: 'Application Successful!',
  ThanksMessage: 'Your application has been received and is now under review by our recruitment team. We will contact you shortly if your profile matches our requirements.',
  NextStepsMessage: 'Our team will review your submission and contact you directly via the email or phone number provided.',
  ThanksFooter: 'Thank you for choosing to grow with us.'
};

const ThanksAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [messageData, setMessageData] = useState(RECRUITMENT_DEFAULTS);
  const [activeField, setActiveField] = useState(null);

  const companyId = localStorage.getItem('companyId');
  const token = localStorage.getItem('authToken');

  const getTenantUrl = useCallback(() => {
    if (!companyId) return null;
    return `/api/companies/${encodeURIComponent(companyId)}/Thanks/settings`;
  }, [companyId]);

  const fetchCurrentSettings = useCallback(async () => {
    const url = getTenantUrl();
    if (!url) return;

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // ✅ Map response to state with defensive fallbacks
        setMessageData({
          ThanksTitle: data.thanksTitle || data.ThanksTitle || RECRUITMENT_DEFAULTS.ThanksTitle,
          ThanksMessage: data.thanksMessage || data.ThanksMessage || RECRUITMENT_DEFAULTS.ThanksMessage,
          NextStepsMessage: data.nextStepsMessage || data.NextStepsMessage || RECRUITMENT_DEFAULTS.NextStepsMessage,
          ThanksFooter: data.thanksFooter || data.ThanksFooter || RECRUITMENT_DEFAULTS.ThanksFooter
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
      toast.error("Could not load current settings.");
    }
  }, [getTenantUrl, token]);

  useEffect(() => {
    fetchCurrentSettings();
  }, [fetchCurrentSettings]);

  const handleSave = async () => {
    const url = getTenantUrl();
    if (!url) {
        toast.error("Company session lost. Please log in again.");
        return;
    }

    const loadingToast = toast.loading('Publishing changes...');
    setLoading(true);

    try {
      // ✅ FIX: Include CompanyId in the body to pass backend validation
      const payload = {
        ...messageData,
        CompanyId: companyId
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload) 
      });

      if (response.ok) {
        toast.success("Design published live!", { id: loadingToast });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error. Please check connection.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    const url = getTenantUrl();
    if (!url) return;

    setMessageData(RECRUITMENT_DEFAULTS);
    const loadingToast = toast.loading('Restoring defaults...');
    setLoading(true);

    try {
      // ✅ FIX: Include CompanyId here as well
      const payload = {
        ...RECRUITMENT_DEFAULTS,
        CompanyId: companyId
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Defaults restored and saved live!", { id: loadingToast });
      } else {
        fetchCurrentSettings(); 
        toast.error("Failed to save defaults.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error. Could not save defaults.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Post-Application Experience
          </h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            Customize the confirmation screen candidates see after applying.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={resetToDefault} disabled={loading} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> {loading ? "Resetting..." : "Reset to Default"}
          </button>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> {loading ? "Publishing..." : "Publish Changes"}
          </button>
        </div>
      </div>

      <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Workshop</h3>
            <p className="card-subtitle">Edit the fields below to update the live page</p>
          </div>
          
          <div className="form-content-area">
            
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label>Success Headline</label>
                <span style={{ fontSize: '12px', color: (messageData.ThanksTitle?.length || 0) >= 50 ? '#ef4444' : '#9ca3af' }}>
                  {messageData.ThanksTitle?.length || 0}/50
                </span>
              </div>
              <input 
                type="text"
                maxLength={50}
                value={messageData.ThanksTitle || ''}
                onFocus={() => setActiveField('title')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setMessageData({...messageData, ThanksTitle: e.target.value})}
                placeholder="e.g. Application Successful!"
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label>Detailed Message</label>
                <span style={{ fontSize: '12px', color: (messageData.ThanksMessage?.length || 0) >= 300 ? '#ef4444' : '#9ca3af' }}>
                  {messageData.ThanksMessage?.length || 0}/300
                </span>
              </div>
              <textarea 
                rows="4"
                maxLength={300}
                value={messageData.ThanksMessage || ''}
                onFocus={() => setActiveField('message')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setMessageData({...messageData, ThanksMessage: e.target.value})}
                placeholder="Explain what happens next..."
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label>Next Steps Description</label>
                <span style={{ fontSize: '12px', color: (messageData.NextStepsMessage?.length || 0) >= 200 ? '#ef4444' : '#9ca3af' }}>
                  {messageData.NextStepsMessage?.length || 0}/200
                </span>
              </div>
              <textarea 
                rows="3"
                maxLength={200}
                value={messageData.NextStepsMessage || ''}
                onFocus={() => setActiveField('steps')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setMessageData({...messageData, NextStepsMessage: e.target.value})}
                placeholder="What should they expect now?"
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label>Closing Tagline</label>
                <span style={{ fontSize: '12px', color: (messageData.ThanksFooter?.length || 0) >= 80 ? '#ef4444' : '#9ca3af' }}>
                  {messageData.ThanksFooter?.length || 0}/80
                </span>
              </div>
              <input 
                type="text"
                maxLength={80}
                value={messageData.ThanksFooter || ''}
                onFocus={() => setActiveField('footer')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setMessageData({...messageData, ThanksFooter: e.target.value})}
                placeholder="e.g. Thank you for choosing to grow with us."
              />
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Monitor size={16} /> Live Candidate View
            </div>

            <div style={{ flex: 1, backgroundColor: '#f7f9fc', borderRadius: '20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '48px 32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    
                    <div style={{ margin: '0 auto 24px auto', width: '64px', height: '64px', backgroundColor: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                        <CheckCircle size={32} />
                    </div>

                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: activeField === 'title' ? '#4f46e5' : '#111827', marginBottom: '12px', lineHeight: '1.2', transition: 'color 0.3s ease' }}>
                        {messageData.ThanksTitle || "Application Successful!"}
                    </h1>

                    <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '32px', lineHeight: '1.6', backgroundColor: activeField === 'message' ? '#f3f4f6' : 'transparent', borderRadius: '8px', padding: activeField === 'message' ? '8px' : '0', transition: 'all 0.3s ease' }}>
                        {messageData.ThanksMessage || "Your application is under review."}
                    </p>

                    <div style={{ backgroundColor: '#ffffff', border: `1px solid ${activeField === 'steps' ? '#6366f1' : '#e5e7eb'}`, borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <Clock size={24} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>Your Next Steps</h2>
                            <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                                {messageData.NextStepsMessage || "We will contact you directly."}
                            </p>
                        </div>
                    </div>

                    <p style={{ fontSize: '14px', color: activeField === 'footer' ? '#4f46e5' : '#9ca3af', margin: 0, transition: 'color 0.3s ease' }}>
                        {messageData.ThanksFooter || "Thank you for choosing to grow with us."}
                    </p>

                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 1024px) {
            .editor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ThanksAdmin;