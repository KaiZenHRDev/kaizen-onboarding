// fileName: components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa'; // Changed from FaTimes to FaBars for consistency
import '../styles/Sidebar.css';

export const Sidebar = ({ isOpen, toggleSidebar, navItems, onNavClick }) => {
  const location = useLocation();

  const handleClick = (item, e) => {
    // On mobile, close sidebar when a link is clicked
    if (window.innerWidth <= 768) {
        toggleSidebar(); 
    }
    
    if (item.isLogout && onNavClick) {
        e.preventDefault(); 
        onNavClick(item);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      
      {/* ✅ NEW: Sidebar Header Area with Toggle Button */}
      <div className="sidebar-header-area">
        <div className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FaBars />
        </div>
        {/* Optional: You could repeat the Logo Text here if you want a full branding inside sidebar */}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={`sidebar-nav-link ${location.pathname === item.to ? 'active' : ''}`}
            onClick={(e) => handleClick(item, e)}
            style={item.isLogout ? { marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.2)' } : {}}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};