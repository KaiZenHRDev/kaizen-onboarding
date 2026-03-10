// fileName: components/Header.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { FaBars } from 'react-icons/fa';
import '../styles/Header.css';

// Default branding when no company is loaded
const defaultBranding = {
  name: "KaiZenHR",
  description: "Human Resources Management System",
  logo: null
};

export const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation(); 
  const [companyInfo, setCompanyInfo] = useState(defaultBranding);

  // Define Backend URL
  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const storedCompanyId = localStorage.getItem("companyId");

      if (!storedCompanyId) {
        setCompanyInfo(defaultBranding);
        return;
      }

      try {
        const response = await fetch(`/api/company/${storedCompanyId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyInfo({
            name: data.companyName || defaultBranding.name,
            description: data.companyDetails || defaultBranding.description,
            logo: data.logoPath || null
          });
        } else {
          setCompanyInfo(defaultBranding);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
        setCompanyInfo(defaultBranding);
      }
    };

    fetchCompanyInfo();
  }, [location.pathname]);

  // Helper to construct the full image URL
  const getLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path; // Already a full URL
    }
    // Prepend backend URL to relative path
    return `${API_BASE_URL}${path}`;
  };

  return (
    <header className="app-header">
      <div className="app-header-container">
        
        {/* 1. Toggle Button (Moved to Left) */}
        {/* ✅ CHANGED: Hidden when Sidebar is open to avoid duplicates */}
        <div 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar}
            style={{ visibility: isSidebarOpen ? 'hidden' : 'visible' }}
        >
          <FaBars />
        </div>

        {/* 2. Main Branding Container */}
        <div className="logo-link" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0', 
            height: '100%',
            overflow: 'hidden' 
        }}>
          
          {/* Logo Section Container */}
          <div className="logo-icon" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 'auto',
              height: 'auto',
              flexShrink: 0 
          }}>
            {companyInfo.logo ? (
              <img 
                src={getLogoUrl(companyInfo.logo)} 
                alt="Company Logo" 
                style={{ 
                    height: 'auto',          
                    maxHeight: '45px',       
                    width: 'auto',           
                    maxWidth: '100%',        
                    objectFit: 'contain', 
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    backgroundColor: 'white', 
                    padding: '2px',
                    display: 'block'
                }}
                onError={(e) => {
                    e.target.style.display = 'none'; 
                }}
              />
            ) : (
              // Default Icon
              <div style={{ 
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
              }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.5 16H8C4.13401 16 1 12.866 1 9C1 5.13401 4.13401 2 8 2H16C19.866 2 23 5.13401 23 9C23 12.866 19.866 16 16 16H11.5L8.5 22L12.5 16Z" />
                  </svg>
              </div>
            )}
          </div>

          {/* Vertical Separator Line */}
          <div style={{
              height: '35px',
              width: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)', 
              margin: '0 15px',
              flexShrink: 0
          }}></div>

          {/* Text Section */}
          <div className="logo-text" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              lineHeight: '1.2',
              overflow: 'hidden' 
          }}>
            <span style={{ 
                fontWeight: 'bold', 
                fontSize: '1.1rem', 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {companyInfo.name}
            </span>
            <small style={{ 
                opacity: 0.8, 
                fontSize: '0.8rem', 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {companyInfo.description}
            </small>
          </div>
        </div>

      </div>
    </header>
  );
};