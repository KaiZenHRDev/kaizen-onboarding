// fileName: EmployeeListStyles.js

export const dashboardStyles = {
  // Main Layout Grid for Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Bulk Action Bar
  bulkActionCard: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px", 
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#1e3a8a",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  // Table Styling
  tableContainer: {
    width: "100%",
    overflowX: "hidden", // Prevents horizontal scrollbar
    borderRadius: "0 0 12px 12px",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  },
  // Decoupled Export Badges
  exportedBadge: {
    backgroundColor: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    whiteSpace: "nowrap",
  },
  profileUpdatedBadge: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    whiteSpace: "nowrap",
  },
  statusAccepted: { backgroundColor: "#dcfce7", color: "#166534" },
  statusRejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
  statusKiv: { backgroundColor: "#fef9c3", color: "#854d0e" },
  statusShortlisted: { backgroundColor: "#f3e8ff", color: "#6b21a8" },
  statusInterview: { backgroundColor: "#ccfbf1", color: "#0f766e" },
  statusPending: { backgroundColor: "#f1f5f9", color: "#475569" },
  
  th: {
    textAlign: "left",
    padding: "16px 8px", 
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    fontSize: "12px",
    textTransform: "uppercase",
    cursor: "pointer",
    userSelect: "none",
    letterSpacing: "0.05em",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  td: {
    padding: "16px 8px", 
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    marginLeft: "6px",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }
};

export const getStatusStyle = (status) => {
    switch (String(status).toLowerCase()) {
      case 'accepted': return dashboardStyles.statusAccepted;
      case 'rejected': return dashboardStyles.statusRejected;
      case 'kiv': return dashboardStyles.statusKiv;
      case 'shortlisted': return dashboardStyles.statusShortlisted;
      case 'interview': return dashboardStyles.statusInterview;
      default: return dashboardStyles.statusPending;
    }
};