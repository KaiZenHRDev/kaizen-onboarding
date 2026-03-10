// fileName: src/pages/EmployeeList/EmployeeListComponents.js
import React from "react";
import { ChevronDown, Check, Download, FileText, CheckCircle, XCircle, AlertCircle, FileDown, Star, Calendar } from "lucide-react";

export const StatusDropdown = ({ statusFilter, setStatusFilter, isOpen, setIsOpen, dropdownRef, statusCounts = {} }) => (
  <div style={{ position: "relative", width: "100%", height: "40px", zIndex: 50 }} ref={dropdownRef}>
    <div 
      onClick={() => setIsOpen(!isOpen)}
      style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", height: "100%", padding: "0 12px", 
          backgroundColor: "white", 
          borderRadius: "8px",
          fontSize: "14px", fontWeight: "500", color: "#374151", cursor: "pointer",
          border: "none", boxSizing: "border-box"
      }}
    >
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {statusFilter} {statusCounts[statusFilter] !== undefined ? `(${statusCounts[statusFilter]})` : ""}
      </span>
      <ChevronDown size={16} color="#6b7280" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', minWidth: "16px" }} />
    </div>
    {isOpen && (
      <div style={{
          position: "absolute", top: "100%", left: "0", width: "100%", marginTop: "6px",
          backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: "6px", display: "flex", flexDirection: "column", gap: "2px",
          zIndex: 100
      }}>
        {["All Status", "Pending", "Interview", "Shortlisted", "Accepted", "Rejected", "KIV"].map(status => (
          <div 
            key={status}
            onClick={() => { setStatusFilter(status); setIsOpen(false); }}
            style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", fontSize: "14px", color: "#4b5563", cursor: "pointer", borderRadius: "6px",
                backgroundColor: statusFilter === status ? "#f3f4f6" : "transparent",
                fontWeight: statusFilter === status ? "600" : "400"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{status}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
                ({statusCounts[status] || 0})
              </span>
            </div>
            {statusFilter === status && <Check size={16} color="#2563eb" />}
          </div>
        ))}
      </div>
    )}
  </div>
);

export const ExportDropdown = ({ onExportCSV, onExportPDF, onExportHR, isOpen, setIsOpen, dropdownRef }) => (
  <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        className="btn" 
        style={{ 
          display: "flex", alignItems: "center", gap: "8px", height: "40px",
          padding: "0 16px", backgroundColor: "white", border: "none",
          borderRadius: "8px", color: "#374151", fontSize: "14px", fontWeight: "500",
          cursor: "pointer", whiteSpace: "nowrap"
        }} 
        onClick={() => setIsOpen(!isOpen)}
      >
          <Download size={16} /> <span>Export</span> <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
          <div style={{
              position: "absolute", top: "100%", right: "0", marginTop: "6px",
              backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: "6px", width: "220px",
              display: "flex", flexDirection: "column", gap: "2px", zIndex: 1000
          }}>
              
              {onExportHR && (
                  <div 
                      onClick={onExportHR}
                      style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                          fontSize: "14px", color: "#166534", cursor: "pointer", borderRadius: "6px",
                          backgroundColor: "#f0fdf4"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dcfce7"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f0fdf4"}
                      title="Export BPO New Join format for selected candidates"
                  >
                      <FileDown size={16} color="#166534" /> <span>Export HR Data (.KZULF)</span>
                  </div>
              )}
              
              <div 
                  onClick={onExportPDF}
                  style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                      fontSize: "14px", color: "#4b5563", cursor: "pointer", borderRadius: "6px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                  <FileText size={16} color="#dc2626" /> <span>Export as PDF</span>
              </div>
          </div>
      )}
  </div>
);

export const getStatusIcon = (status) => {
    switch (String(status).toLowerCase()) {
      case 'accepted': return <CheckCircle size={12} />;
      case 'rejected': return <XCircle size={12} />;
      case 'kiv': return <AlertCircle size={12} />;
      case 'shortlisted': return <Star size={12} />;
      case 'interview': return <Calendar size={12} />;
      default: return null;
    }
};