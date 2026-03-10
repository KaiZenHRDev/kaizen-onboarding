// fileName: App.js

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

// Pages
import PersonalForm from "./pages/PersonalForm"; 
import EmployeeList from "./pages/EmployeeList/EmployeeList";
import ContactForm from "./pages/ContactForm"; 
import QualificationForm from "./pages/QualificationForm"; 
import EmploymentHistoryForm from "./pages/EmploymentHistoryForm"; 
import SkillForm from "./pages/SkillForm"; 
import HobbyLanguageForm from "./pages/HobbyLanguageForm";
import ResumeForm from "./pages/ResumeForm"; 
import ReviewPage from './pages/ReviewPage';
import FieldExp from "./pages/FieldExp"; 
import ThanksPage from './pages/ThanksPage';
import ThanksAdmin from './pages/ThanksAdmin'; 
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import LoginAdmin from './pages/LoginAdmin'; 
import AdminUpdate from './pages/AdminUpdate';
import ChangePassword from './pages/ChangePassword';
import CreateAdminPage from './pages/CreateAdminPage'; 
import AdminList from './pages/AdminList'; 
import CreateCompany from './pages/CreateCompany';
import CompanyUpdate from './pages/CompanyUpdate'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotPasswordAdmin from './pages/ForgotPasswordAdmin'; // ✅ Added Admin Forgot Password
import HrAdapterPage from "./pages/EmployeeList/HrAdapterPage";

import "./styles/App.css";

// --- 1. Define Navigation Groups ---

const publicNavItems = [
    { id: "login", label: "Candidate Login", to: "/login" },
    { id: "admin-login", label: "Admin Login", to: "/admin-login" }, 
    { id: "signup", label: "Sign Up", to: "/signup" },
];

const adminNavItems = [
    { id: "employees", label: "Candidate Directory", to: "/candidates" },
    { id: "admin-update", label: "Admin Update", to: "/admin-update" },
    { id: "thanks-admin", label: "Thanks Page Settings", to: "/thanks-settings" }, 
    { id: "logout", label: "Logout", to: "/login", isLogout: true }
];

const superAdminNavItems = [
    { id: "create-company", label: "Create Company", to: "/create-company" }, 
    { id: "create-admin", label: "Create Admin", to: "/create-admin" }, 
    { id: "company-update", label: "Edit Company", to: "/company-update" },
    { id: "admin-list", label: "Manage Admins", to: "/admin-list" }, 
    { id: "logout", label: "Logout", to: "/login", isLogout: true }
];

const candidateNavItems = [
    { id: "new-employee", label: "Personal Information", to: "/candidates/new" }, 
    { id: "contact", label: "Contact", to: "/contact" }, 
    { id: "qualification", label: "Qualification", to: "/qualification" }, 
    { id: "employment", label: "Employment History", to: "/employment" }, 
    { id: "skills", label: "Skills", to: "/skills" }, 
    { id: "hobby-language", label: "Hobby & Language", to: "/hobby-language" },
    { id: "field-experience", label: "Field Experience", to: "/field-experience" },
    { id: "resume", label: "Resume Upload", to: "/resume" }, 
    { id: "logout", label: "Logout", to: "/login", isLogout: true }
];

// --- 2. Protected Route Component ---
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'admin' || userRole === 'superadmin') {
            return <Navigate to="/candidates" replace />;
        } else {
            return <Navigate to="/candidates/new" replace />;
        }
    }

    return children;
};

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [currentNavItems, setCurrentNavItems] = useState(publicNavItems);
    
    const location = useLocation();
    const navigate = useNavigate();

    const userRole = localStorage.getItem("userRole");
    
    // UI Helpers
    // ✅ Updated to include /admin-forgot-password so sidebar hides properly
    const isStandardAuthPage = ['/login', '/admin-login', '/signup', '/forgot-password', '/admin-forgot-password'].includes(location.pathname);
    const isAdminChangePassword = location.pathname === '/change-password' && (userRole === 'admin' || userRole === 'superadmin');
    const shouldHideSidebar = isStandardAuthPage || isAdminChangePassword;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Update Navigation Menu based on Role and Route changes
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role === "superadmin") {
            setCurrentNavItems(superAdminNavItems); 
        } else if (role === "admin") {
            setCurrentNavItems(adminNavItems);
        } else if (role === "candidate") {
            setCurrentNavItems(candidateNavItems);
        } else {
            setCurrentNavItems(publicNavItems);
        }
    }, [location.pathname]); 

    // ✅ UPDATED: Multi-Tenant Theme Application
    // Uses the Global api/company/{id} endpoint to fetch branding
    useEffect(() => {
        const applyTheme = async () => {
            const companyId = localStorage.getItem("companyId");
            const defaultPrimary = '#7c3aed'; 
            const defaultSecondary = '#6366f1';

            if (!companyId) {
                document.documentElement.style.setProperty('--theme-primary', defaultPrimary);
                document.documentElement.style.setProperty('--theme-secondary', defaultSecondary);
                return;
            }

            try {
                // GLOBAL ROUTE: Fetches company metadata (colors/logo)
                const response = await fetch(`/api/company/${encodeURIComponent(companyId)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.colourCode) {
                        document.documentElement.style.setProperty('--theme-primary', data.colourCode);
                        document.documentElement.style.setProperty('--theme-secondary', data.colourCode);
                    }
                }
            } catch (error) {
                console.error("Theme Load Error:", error);
                document.documentElement.style.setProperty('--theme-primary', defaultPrimary);
                document.documentElement.style.setProperty('--theme-secondary', defaultSecondary);
            }
        };
        applyTheme();
    }, [location.pathname]); // Re-run on navigation to catch login/logout ID changes

    const handleNavClick = (item) => {
        if (item.isLogout) {
            const role = localStorage.getItem("userRole");
            localStorage.clear(); 
            document.documentElement.style.removeProperty('--theme-primary');
            document.documentElement.style.removeProperty('--theme-secondary');

            if (role === "admin" || role === "superadmin") {
                navigate("/admin-login");
            } else {
                navigate("/login");
            }
        }
    };

    return (
        <div className="app-container">
            {!shouldHideSidebar && (
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar} 
                    navItems={currentNavItems}
                    onNavClick={handleNavClick} 
                />
            )}
            
            <div 
                className={`content-wrapper ${!shouldHideSidebar && isSidebarOpen ? 'sidebar-open' : ''}`}
                style={shouldHideSidebar ? { marginLeft: 0 } : {}}
            >
                <Header 
                    toggleSidebar={toggleSidebar} 
                    isSidebarOpen={isSidebarOpen} 
                />
                
                <main className="main-content py-6">
                    <div className="container mx-auto px-4">
                        <Routes>
                            {/* --- PUBLIC ROUTES --- */}
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/admin-login" element={<LoginAdmin />} />
                            <Route path="/signup" element={<SignUpPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/admin-forgot-password" element={<ForgotPasswordAdmin />} /> {/* ✅ Added Route */}
                            
                            {/* --- SUPER ADMIN (System Level) --- */}
                            <Route path="/create-company" element={
                                <ProtectedRoute allowedRoles={['superadmin']}>
                                    <CreateCompany />
                                </ProtectedRoute>
                            } /> 
                            <Route path="/company-update" element={
                                <ProtectedRoute allowedRoles={['superadmin']}>
                                    <CompanyUpdate />
                                </ProtectedRoute>
                            } /> 
                            <Route path="/admin-list" element={
                                <ProtectedRoute allowedRoles={['superadmin']}>
                                    <AdminList />
                                </ProtectedRoute>
                            } />
                            <Route path="/create-admin" element={
                                <ProtectedRoute allowedRoles={['superadmin']}>
                                    <CreateAdminPage />
                                </ProtectedRoute>
                            } />

                            {/* --- ADMIN & SUPER ADMIN (Tenant Management) --- */}
                            <Route path="/candidates" element={
                                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                    <EmployeeList />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin-update" element={
                                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                    <AdminUpdate />
                                </ProtectedRoute>
                            } />
                            <Route path="/thanks-settings" element={
                                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                    <ThanksAdmin />
                                </ProtectedRoute>
                            } />
                            <Route path="/hr-adapter/:companyId/:candidateId" element={
                                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                    <HrAdapterPage />
                                </ProtectedRoute>
                            } />
                            {/* --- SHARED --- */}
                            <Route path="/change-password" element={
                                <ProtectedRoute allowedRoles={['candidate', 'admin', 'superadmin']}>
                                    <ChangePassword />
                                </ProtectedRoute>
                            } />
                            
                            {/* --- CANDIDATE ONLY (Onboarding Flow) --- */}
                            <Route path="/candidates/new" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <PersonalForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/contact" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <ContactForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/qualification" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <QualificationForm />
                                </ProtectedRoute>
                            } /> 
                            <Route path="/employment" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <EmploymentHistoryForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/skills" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <SkillForm />
                                </ProtectedRoute>
                            } /> 
                            <Route path="/hobby-language" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <HobbyLanguageForm />
                                </ProtectedRoute>
                            } /> 
                            <Route path="/field-experience" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <FieldExp />
                                </ProtectedRoute>
                            } />
                            <Route path="/resume" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <ResumeForm />
                                </ProtectedRoute>
                            } />
                            <Route path="/review" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <ReviewPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/thanks" element={
                                <ProtectedRoute allowedRoles={['candidate']}>
                                    <ThanksPage />
                                </ProtectedRoute>
                            } />

                        </Routes>
                    </div>
                </main>
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
}

export default App;