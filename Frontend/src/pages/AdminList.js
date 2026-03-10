// fileName: pages/AdminList.js
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, RefreshCw, Shield, Search, Users, Activity, Building2, Filter, ChevronDown, Check, Ban, AlertTriangle } from 'lucide-react';

// --- CUSTOM STYLES ---
const dashboardStyles = {
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "24px" },
  statCard: { backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  iconCircle: { width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  tableContainer: { width: "100%", overflowX: "hidden", borderRadius: "0 0 12px 12px" },
  badge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize", display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" },
  statusActive: { backgroundColor: "#dcfce7", color: "#166534" }, 
  statusPending: { backgroundColor: "#fef9c3", color: "#854d0e" }, 
  statusDisabled: { backgroundColor: "#fee2e2", color: "#991b1b" }, 
  th: { textAlign: "left", padding: "16px 24px", backgroundColor: "#f8fafc", color: "#64748b", fontWeight: "600", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", fontSize: "12px", textTransform: "uppercase", cursor: "pointer", userSelect: "none", letterSpacing: "0.05em" },
  td: { padding: "16px 24px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle", whiteSpace: "nowrap", fontSize: "14px" },
  actionBtn: { background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "6px", marginLeft: "6px", transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modalContent: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e5e7eb', animation: 'fadeIn 0.2s ease-out' }
};

const CompanyFilterDropdown = ({ options, selected, setSelected, isOpen, setIsOpen, dropdownRef }) => (
    <div style={{ position: "relative", width: "200px", height: "40px", zIndex: 50 }} ref={dropdownRef}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", height: "100%", padding: "0 12px", backgroundColor: "white", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: "pointer", border: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={14} color="#6b7280" />{selected}</span>
            <ChevronDown size={16} color="#6b7280" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', minWidth: "16px" }} />
        </div>
        {isOpen && (
            <div style={{ position: "absolute", top: "100%", right: "0", width: "240px", marginTop: "6px", backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", zIndex: 100, maxHeight: "300px", overflowY: "auto" }}>
                {options.map(option => (
                    <div key={option} onClick={() => { setSelected(option); setIsOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", fontSize: "14px", color: "#4b5563", cursor: "pointer", borderRadius: "6px", backgroundColor: selected === option ? "#f3f4f6" : "transparent", fontWeight: selected === option ? "600" : "400" }}>
                        <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{option}</span>
                        {selected === option && <Check size={16} color="#2563eb" />}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const AdminList = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState("All Companies");
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const companyDropdownRef = useRef(null);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false, type: null, id: null, title: '', message: '', confirmText: '', confirmColor: '', data: null
    });
    
    useEffect(() => {
        fetchAdmins();
        const handleClickOutside = (event) => {
            if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
                setIsCompanyDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ UPDATED: Fetch Admins using the secure company path
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const companyId = localStorage.getItem('companyId');

            if (!companyId) {
                toast.error("Company Context Missing. Please login again.");
                return;
            }

            const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/auth/admins`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            } else {
                toast.error("Failed to load admin list.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Connection error loading admins.");
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (id, email) => {
        setModalConfig({
            isOpen: true, type: 'delete', id: id, title: 'Delete Admin?', confirmText: 'Delete Account', confirmColor: '#ef4444',
            message: `Are you sure you want to delete "${email}"? This action cannot be undone.`,
            data: { email }
        });
    };

    const initiateToggle = (id, currentStatus) => {
        const action = currentStatus ? "Disable" : "Enable";
        setModalConfig({
            isOpen: true, type: 'toggle', id: id, title: `${action} Admin Account?`, confirmText: currentStatus ? 'Disable' : 'Enable',
            confirmColor: currentStatus ? '#d97706' : '#16a34a',
            message: `Are you sure you want to ${action.toLowerCase()} this admin account?`,
            data: { currentStatus }
        });
    };

    // ✅ UPDATED: Execute actions using the secure company path
    const executeAction = async () => {
        const { type, id, data } = modalConfig;
        const token = localStorage.getItem('authToken');
        const companyId = localStorage.getItem('companyId');

        setModalConfig({ ...modalConfig, isOpen: false });

        try {
            if (type === 'delete') {
                const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/auth/admin/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    toast.success("Admin deleted successfully.");
                    setAdmins(admins.filter(admin => admin.id !== id));
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Failed to delete admin.");
                }
            } 
            else if (type === 'toggle') {
                const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/auth/admin/${id}/toggle-status`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const currentStatus = data.currentStatus;
                    setAdmins(admins.map(admin => 
                        admin.id === id ? { ...admin, isActive: !admin.isActive } : admin
                    ));

                    toast.success(`Account ${currentStatus ? 'disabled' : 'activated'} successfully.`);
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Failed to update status.");
                }
            }
        } catch (error) {
            toast.error("Connection error.");
        }
    };

    const uniqueCompanies = ["All Companies", ...new Set(admins.map(a => a.companyId).filter(Boolean).sort())];

    const filteredAdmins = admins.filter(admin => {
        const companyName = admin.companyName || "";
        const matchesSearch = admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              admin.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = companyFilter === "All Companies" || admin.companyId === companyFilter;
        return matchesSearch && matchesCompany;
    });

    const activeAdmins = admins.filter(a => a.isActive).length;
    const totalCompanies = [...new Set(admins.map(a => a.companyId))].length;

    const getStatusStyle = (admin) => {
        if (!admin.isActive) return dashboardStyles.statusDisabled;
        if (admin.isFirstLogin) return dashboardStyles.statusPending;
        return dashboardStyles.statusActive;
    };
    
    const getStatusText = (admin) => {
        if (!admin.isActive) return 'Disabled';
        if (admin.isFirstLogin) return 'Pending First Login';
        return 'Active';
    }

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={dashboardStyles.statsGrid}>
                <div style={dashboardStyles.statCard}>
                    <div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>Total Admins</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{admins.length}</h2></div>
                    <div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#eff6ff" }}><Users size={24} color="#3b82f6" /></div>
                </div>
                <div style={dashboardStyles.statCard}>
                    <div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>Active Admins</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{activeAdmins}</h2></div>
                    <div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#f0fdf4" }}><Activity size={24} color="#16a34a" /></div>
                </div>
                <div style={dashboardStyles.statCard}>
                    <div><p style={{color: "#6b7280", fontSize: "14px", fontWeight: "500"}}>Companies Managed</p><h2 style={{fontSize: "30px", fontWeight: "700", color: "#111827"}}>{totalCompanies}</h2></div>
                    <div style={{ ...dashboardStyles.iconCircle, backgroundColor: "#fff7ed" }}><Building2 size={24} color="#f97316" /></div>
                </div>
            </div>

            <div className="card" style={{ overflow: "visible" }}>
                <div className="card-header" style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px 24px", backgroundColor: "#6366f1", borderRadius: "12px 12px 0 0", color: "white" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <Shield size={24} color="white" />
                        <h2 className="card-title" style={{ margin: 0, fontSize: "18px", color: "white", whiteSpace: "nowrap" }}>Admin Management</h2>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', whiteSpace: "nowrap" }}>{filteredAdmins.length} users</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end", flexWrap: "nowrap" }}>
                        <div style={{ position: "relative", width: "220px" }}>
                            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", width: "16px" }} />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: "38px", width: "100%", height: "40px", fontSize: "14px", backgroundColor: "white", border: "none", borderRadius: "8px", color: "#374151", boxSizing: "border-box" }} />
                        </div>
                        <CompanyFilterDropdown options={uniqueCompanies} selected={companyFilter} setSelected={setCompanyFilter} isOpen={isCompanyDropdownOpen} setIsOpen={setIsCompanyDropdownOpen} dropdownRef={companyDropdownRef} />
                        <button className="btn" onClick={() => navigate('/create-admin')} style={{ display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 16px", backgroundColor: "white", border: "none", borderRadius: "8px", color: "#4f46e5", fontSize: "14px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                            <UserPlus size={16} /> <span>New Admin</span>
                        </button>
                    </div>
                </div>

                <div style={dashboardStyles.tableContainer}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "14px" }}>
                        <thead>
                            <tr>
                                <th style={{ ...dashboardStyles.th, width: '30%' }}>Email / Username</th>
                                <th style={{ ...dashboardStyles.th, width: '15%' }}>Company ID</th>
                                <th style={{ ...dashboardStyles.th, width: '20%' }}>Company Name</th> 
                                <th style={{ ...dashboardStyles.th, width: '15%' }}>Status</th>
                                <th style={{ ...dashboardStyles.th, width: '15%' }}>Created At</th>
                                <th style={{ ...dashboardStyles.th, width: '5%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}><RefreshCw className="animate-spin" style={{ margin: '0 auto', display: 'block', marginBottom: '10px' }} />Loading admins...</td></tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>No admins found matching your filters.</td></tr>
                            ) : (
                                filteredAdmins.map(admin => (
                                    <tr key={admin.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s', opacity: admin.isActive ? 1 : 0.7 }}>
                                        <td style={dashboardStyles.td}><div style={{ fontWeight: '600', color: '#0f172a' }}>{admin.email}</div></td>
                                        <td style={dashboardStyles.td}><span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#6366f1', backgroundColor: '#eef2ff', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{admin.companyId}</span></td>
                                        <td style={dashboardStyles.td}>{admin.companyName || '-'}</td>
                                        <td style={dashboardStyles.td}><span style={{ ...dashboardStyles.badge, ...getStatusStyle(admin) }}>{getStatusText(admin)}</span></td>
                                        <td style={dashboardStyles.td}>{new Date(admin.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td style={{ ...dashboardStyles.td, textAlign: 'right' }}>
                                            <button onClick={() => initiateToggle(admin.id, admin.isActive)} style={{ ...dashboardStyles.actionBtn, color: admin.isActive ? '#d97706' : '#16a34a', backgroundColor: admin.isActive ? '#fffbeb' : '#f0fdf4' }} title={admin.isActive ? "Disable Account" : "Enable Account"}>
                                                {admin.isActive ? <Ban size={18} /> : <Check size={18} />}
                                            </button>
                                            <button onClick={() => initiateDelete(admin.id, admin.email)} style={{ ...dashboardStyles.actionBtn, color: '#ef4444', backgroundColor: '#fee2e2' }} title="Delete Admin">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalConfig.isOpen && (
                <div style={dashboardStyles.modalOverlay}>
                    <div style={dashboardStyles.modalContent}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: modalConfig.type === 'delete' ? '#fee2e2' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={20} color={modalConfig.type === 'delete' ? '#ef4444' : '#f97316'} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>{modalConfig.title}</h3>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{modalConfig.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={executeAction} style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: modalConfig.confirmColor, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{modalConfig.confirmText}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminList;