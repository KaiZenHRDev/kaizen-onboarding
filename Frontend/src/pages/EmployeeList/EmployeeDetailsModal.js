// fileName: src/pages/EmployeeList/EmployeeDetailsModal.js
import React, { useState, useEffect } from "react";
import { X, FileText, User, Phone, Briefcase, GraduationCap, Star, ShieldCheck, Eye, FileSpreadsheet, Check, CheckCircle2 } from "lucide-react";
import { dashboardStyles, getStatusStyle } from "./EmployeeListStyles";
import { formatDate } from "./EmployeeListUtils";

const EmployeeDetailsModal = ({ 
    employee, 
    isOpen, 
    onClose, 
    onDelete,
    onStatusUpdate,
    onDownloadResume,
    onPreviewResume, 
    getEntryDate,
    onPrepareHrExport
}) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [fullData, setFullData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH DATA ON OPEN ---
    useEffect(() => {
        const fetchFullDetails = async (candidateId, companyId) => {
            setLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem("authToken"); 

                if (!token) {
                    console.error("No token found in localStorage (looked for 'authToken')");
                    throw new Error("Authentication missing. Please log in again.");
                }

                if (!companyId || !candidateId) {
                    throw new Error("Missing Company ID or Candidate ID for request.");
                }

                const url = `/api/companies/${encodeURIComponent(companyId)}/Candidates/${candidateId}`;
                
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                if (!res.ok) {
                    if (res.status === 401) throw new Error("Session expired. Please log in again.");
                    if (res.status === 403) throw new Error("Access Denied: You do not have permission.");
                    if (res.status === 404) throw new Error("Candidate profile not found.");
                    throw new Error(`Error ${res.status}`);
                }

                const jsonResponse = await res.json();
                
                // Handle Wrapped Response from Backend ({ Profile: ..., ResumePath: ... })
                const data = jsonResponse.profile || jsonResponse.Profile || jsonResponse;
                const resumePath = jsonResponse.resumePath || jsonResponse.ResumePath || data.resumePath;

                setFullData({
                    basic: { ...data, ...employee, ...data }, 
                    contact: data.contactInfo || {},
                    quals: data.qualifications || [],
                    jobs: data.employmentHistory || [],
                    skills: Array.isArray(data.skills) ? (data.skills[0] || {}) : (data.skills || {}), 
                    hobbyLang: {
                        languages: data.languages || [],
                        hobbies: data.hobbies || [],
                        resume: resumePath 
                    },
                    fieldExps: data.fieldExperiences || []
                });

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "Failed to load full candidate details.");
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && employee?.candidateId && employee?.companyId) {
            fetchFullDetails(employee.candidateId, employee.companyId);
        } else if (isOpen) {
             setError("Cannot load details: Missing Candidate or Company ID.");
        } else {
            setFullData(null);
            setLoading(false);
        }
    }, [isOpen, employee]);

    if (!employee || !isOpen) return null;

    const resumeAvailable = !loading && (fullData?.hobbyLang?.resume || employee.resume);

    // --- TABS CONFIGURATION ---
    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={16} /> },
        { id: 'contact', label: 'Contact', icon: <Phone size={16} /> },
        { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
        { id: 'skills', label: 'Skills & Misc', icon: <Star size={16} /> },
        { id: 'hr', label: 'HR Actions', icon: <ShieldCheck size={16} /> },
    ];

    const tabStyle = (isActive) => ({
      padding: '12px 16px', 
      cursor: 'pointer', 
      borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
      borderTop: 'none', 
      borderLeft: 'none',
      borderRight: 'none',
      color: isActive ? '#2563eb' : '#6b7280', 
      fontWeight: '600', 
      fontSize: '14px', 
      background: 'none', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      transition: 'all 0.2s'
    });

    const Field = ({ l, v, fullWidth }) => (
        <div style={{ marginBottom: "16px", gridColumn: fullWidth ? "1 / -1" : "auto" }}>
            <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</span>
            <div style={{ fontSize: "14px", color: "#111827", fontWeight: "500", lineHeight: "1.4" }}>{v || "-"}</div>
        </div>
    );

    const SectionTitle = ({ title }) => (
        <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#374151", margin: "24px 0 16px 0", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
            {title}
        </h4>
    );

    const renderContent = () => {
        if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}><div className="spinner"></div><p style={{marginTop: "10px"}}>Loading full candidate profile...</p></div>;
        if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>{error}</div>;
        if (!fullData) return null;

        const { basic, contact, quals, jobs, skills, hobbyLang, fieldExps } = fullData;
        const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px 24px" };

        switch (activeTab) {
            case "profile": return (
                <div>
                    <div style={gridStyle}>
                        <Field l="Full Name" v={`${basic?.salutationDescription || basic?.salutationCode || ''} ${basic?.fullName || ''}`} />
                        <Field l="Candidate ID" v={basic?.candidateId} />
                        <Field l="Company ID" v={basic?.companyId} />
                        <Field l="Position" v={`${basic?.positionName || '-'} (${basic?.positionCode || '-'})`} />
                        <Field l="Entry Date" v={formatDate(basic?.entryDate)} />
                        <Field l="Identity Card (New)" v={basic?.newIcNumber} />
                        <Field l="Identity Card (Old)" v={basic?.oldIcNumber} />
                        <Field l="Passport" v={basic?.passport} />
                    </div>
                    <SectionTitle title="Demographics" />
                    <div style={gridStyle}>
                        <Field l="Gender" v={basic?.genderDescription || basic?.gender} />
                        <Field l="Date of Birth" v={formatDate(basic?.birthDate)} />
                        <Field l="Marital Status" v={basic?.maritalStatusDescription || basic?.maritalStatusCode} />
                        <Field l="Race" v={basic?.raceDescription || basic?.raceCode} />
                        <Field l="Religion" v={basic?.religionDescription || basic?.religionCode} />
                        <Field l="Nationality" v={basic?.nationalityDescription || basic?.nationalityCode} />
                        <Field l="Country of Origin" v={basic?.countryOfOriginDescription || basic?.countryOfOriginCode} />
                        <Field l="Native Status" v={basic?.nativeStatus} />
                    </div>
                </div>
            );
            case "contact": return (
                <div>
                    <SectionTitle title="General Contact" />
                    <div style={gridStyle}>
                        <Field l="Email" v={contact?.email} />
                        <Field l="Mobile Phone" v={contact?.phoneNumber} />
                        <Field l="Office Phone" v={contact?.officeNumber} />
                        <Field l="Other Phone" v={contact?.otherNumber} />
                    </div>
                    <SectionTitle title="Addresses" />
                    <div style={gridStyle}>
                        <Field l="Correspondence Address" v={contact?.correspondenceAddress || '-'} fullWidth />
                        <Field l="Correspondence Phone" v={contact?.correspondencePhone} />
                        <Field l="Permanent Address" v={contact?.permanentAddress} fullWidth />
                        <Field l="Permanent Phone" v={contact?.permanentPhone} />
                    </div>
                    <SectionTitle title="Emergency Contact" />
                    <div style={gridStyle}>
                        <Field l="Emergency Contact Name" v={contact?.emergencyContactName} />
                        <Field l="Emergency Phone" v={contact?.emergencyPhone} />
                        <Field l="Emergency Address" v={contact?.emergencyAddress} fullWidth />
                    </div>
                </div>
            );
            case "education": return (
                <div>
                    {quals.length === 0 ? <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No qualifications recorded.</p> : 
                     quals.map((q, i) => (
                        <div key={i} style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                <h5 style={{margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e40af'}}>{q.qualificationName || q.qualificationCode}</h5>
                                <span style={{fontSize: '12px', fontWeight: '600', color: '#6b7280'}}>{formatDate(q.joinSchoolDate)} - {formatDate(q.sinceWhenDate)}</span>
                            </div>
                            <div style={{fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px'}}>{q.schoolName}</div>
                            <div style={gridStyle}>
                                <Field l="Level / Sub" v={q.qualificationSubName || q.qualificationSubCode} />
                                <Field l="Grade / CGPA" v={`${q.qualificationGradeName || q.qualificationGradeCode || '-'} (CGPA: ${q.cgpa || '-'})`} />
                                <Field l="Rank" v={q.qualificationGradeRank} />
                                <Field l="Highest Qual?" v={q.isHighest ? "Yes" : "No"} />
                            </div>
                        </div>
                    ))}
                </div>
            );
            case "experience": return (
                <div>
                     <SectionTitle title="Employment History" />
                     {jobs.length === 0 ? <p style={{color: '#9ca3af', fontStyle: 'italic', marginBottom: '24px'}}>No employment history recorded.</p> : 
                      jobs.map((j, i) => (
                        <div key={i} style={{ backgroundColor: '#fff', borderLeft: '4px solid #3b82f6', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h5 style={{margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827'}}>{j.jobName || j.jobCode}</h5>
                                <span style={{fontSize: '12px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', height: 'fit-content'}}>
                                    {formatDate(j.fromDate)} - {j.toDate ? formatDate(j.toDate) : "Present"}
                                </span>
                            </div>
                            <div style={{fontSize: '14px', color: '#4b5563', marginBottom: '12px', fontWeight: '500'}}>{j.employerName}</div>
                            <div style={gridStyle}>
                                <Field l="Salary (Start - End)" v={`${j.startSalary || '-'} to ${j.lastSalary || '-'}`} />
                                <Field l="Industry" v={j.industryCode} />
                                <Field l="Cessation Reason" v={j.cessationReasonDescription || j.cessationReasonCode} />
                            </div>
                            {j.jobFunction && <div style={{marginTop: '8px', fontSize: '13px', color: '#374151', lineHeight: '1.5', background: '#f9fafb', padding: '8px', borderRadius: '4px'}}><strong>Responsibilities:</strong> {j.jobFunction}</div>}
                        </div>
                      ))}
                     
                     <SectionTitle title="Field Experience" />
                     {fieldExps.length === 0 ? <p style={{color: '#9ca3af', fontStyle: 'italic'}}>No field experience recorded.</p> : 
                      fieldExps.map((f, i) => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', padding: '12px 0'}}>
                            <div>
                                <div style={{fontWeight: '600', fontSize: '14px'}}>{f.fieldName || f.fieldAreaCode}</div>
                                <div style={{fontSize: '13px', color: '#6b7280'}}>{f.description}</div>
                            </div>
                            <div style={{fontWeight: '700', color: '#374151', fontSize: '14px'}}>{f.yearsOfExperience} Years</div>
                        </div>
                      ))}
                </div>
            );
            case "skills": return (
                <div>
                    <SectionTitle title="Professional Skills" />
                    <div style={{...gridStyle, gridTemplateColumns: "1fr"}}>
                        <Field l="Office Skills" v={skills?.officeSkills} />
                        <Field l="Other Relevant Skills" v={skills?.otherRelevantSkills} />
                        <Field l="Skill Notes" v={skills?.otherSkillInformation} />
                    </div>

                    <SectionTitle title="Languages" />
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
                        {(hobbyLang?.languages || []).length === 0 ? <span style={{color:'#9ca3af'}}>None</span> :
                          (hobbyLang.languages).map((l, i) => (
                            <span key={i} style={{background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '6px', fontSize: '13px'}}>
                                <strong>{l.languageName || l.languageCode}</strong> <span style={{fontSize: '11px', opacity: 0.8}}>(R:{l.readLevel} W:{l.writtenLevel} S:{l.spokenLevel})</span>
                            </span>
                        ))}
                    </div>

                    <SectionTitle title="Hobbies" />
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
                        {(hobbyLang?.hobbies || []).length === 0 ? <span style={{color:'#9ca3af'}}>None</span> :
                          (hobbyLang.hobbies).map((h, i) => (
                            <span key={i} style={{background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '20px', fontSize: '13px'}}>
                                {h.hobbyName || h.hobbyCode} ({h.abilityLevel})
                            </span>
                        ))}
                    </div>
                </div>
            );
            case "hr": return (
                <div>
                     <SectionTitle title="Recommendations & Referrals" />
                     <div style={gridStyle}>
                        <Field l="Recommendation Type" v={basic?.recommendationType} />
                        <Field l="Details" v={basic?.recommendationDetails} />
                        <Field l="Referee 1" v={basic?.referee1} />
                        <Field l="Referee 2" v={basic?.referee2} />
                     </div>
                     <SectionTitle title="Health & Disability" />
                     <div style={gridStyle}>
                        <Field l="Disability Status" v={basic?.disability} />
                     </div>
                     
                     <div style={{marginTop: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                        <h4 style={{margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#475569'}}>System Status Management</h4>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            {/* HR Decision Status */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <span style={{ width: '120px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>HR Decision:</span>
                                <select 
                                    value={employee.status || "Pending"}
                                    onChange={(e) => onStatusUpdate(e.target.value)}
                                    style={{
                                        ...dashboardStyles.badge, 
                                        ...getStatusStyle(employee.status),
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '8px 16px',
                                        outline: 'none',
                                        appearance: 'none',
                                        minWidth: '160px'
                                    }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="KIV">KIV</option>
                                </select>
                            </div>

                            {/* Export / Data Push Status */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <span style={{ width: '120px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Export Status:</span>
                                {String(employee.exportStatus || "").toLowerCase() === "exported" && (
                                    <span style={{ ...dashboardStyles.exportedBadge, fontSize: '13px', padding: '6px 12px', border: '1px solid #86efac' }}>
                                        <Check size={14}/> System Data Exported
                                    </span>
                                )}
                                {String(employee.exportStatus || "").toLowerCase() === "profile updated" && (
                                    <span style={{ ...dashboardStyles.profileUpdatedBadge, fontSize: '13px', padding: '6px 12px', border: '1px solid #bfdbfe' }}>
                                        <CheckCircle2 size={14}/> Profile Updated in HrAdapter
                                    </span>
                                )}
                                {(String(employee.exportStatus || "").toLowerCase() === "pending" || !employee.exportStatus) && (
                                    <span style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                                        Not processed or exported yet.
                                    </span>
                                )}
                            </div>
                        </div>

                     </div>
                </div>
            );
            default: return null;
        }
    };

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }} onClick={onClose}>
        <div className="card" style={{ width: "100%", maxWidth: "900px", height: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="card-header" style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 className="card-title" style={{fontSize: '20px', margin: 0}}>{employee.fullName}</h3>
                        {String(employee.exportStatus || "").toLowerCase() === "exported" && (
                             <span style={dashboardStyles.exportedBadge} title="HR Data Exported"><Check size={12}/> Exported</span>
                        )}
                        {String(employee.exportStatus || "").toLowerCase() === "profile updated" && (
                             <span style={dashboardStyles.profileUpdatedBadge} title="Profile Updated in HrAdapter"><CheckCircle2 size={12}/> Profile Updated</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                        <span>ID: {employee.candidateId}</span>
                        <span>•</span>
                        <span>{employee.positionName} ({employee.positionCode})</span>
                    </div>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: '4px' }} onClick={onClose}><X size={24} /></button>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", padding: "0 24px", backgroundColor: "#fff", overflowX: 'auto', flexShrink: 0 }}>
            {tabs.map(tab => (
                <button key={tab.id} style={tabStyle(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} {tab.label}
                </button>
            ))}
          </div>

          {/* CONTENT (Scrollable) */}
          <div style={{ padding: "32px", overflowY: "auto", flexGrow: 1, backgroundColor: "#fff" }}>
              {renderContent()}
          </div>
          
          {/* FOOTER */}
          <div style={{ 
              padding: "20px 32px", 
              backgroundColor: "#f9fafb", 
              borderTop: "1px solid #e5e7eb", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexShrink: 0
          }}>
             <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                    onClick={(e) => resumeAvailable && onPreviewResume(e, employee.candidateId, employee.companyId)} 
                    disabled={!resumeAvailable}
                    className="btn"
                    style={{
                        backgroundColor: resumeAvailable ? '#fff' : '#f3f4f6', 
                        color: resumeAvailable ? '#374151' : '#9ca3af', 
                        border: resumeAvailable ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontWeight: '600',
                        cursor: resumeAvailable ? 'pointer' : 'not-allowed',
                        opacity: resumeAvailable ? 1 : 0.8
                    }}
                >
                    <Eye size={16} /> View Resume
                </button>

                <button 
                    onClick={(e) => resumeAvailable && onDownloadResume(e, employee.candidateId, employee.companyId)} 
                    disabled={!resumeAvailable}
                    className="btn"
                    style={{
                        backgroundColor: resumeAvailable ? '#eff6ff' : '#f3f4f6', 
                        color: resumeAvailable ? '#1d4ed8' : '#9ca3af', 
                        border: resumeAvailable ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontWeight: '600',
                        cursor: resumeAvailable ? 'pointer' : 'not-allowed',
                        opacity: resumeAvailable ? 1 : 0.8
                    }}
                >
                    <FileText size={16} /> {loading ? "Checking..." : (resumeAvailable ? "Download Resume" : "No Resume")}
                </button>

                <button 
                    onClick={() => {
                        onClose(); // Close the modal before navigating
                        onPrepareHrExport(employee);
                    }}
                    className="btn"
                    style={{
                        backgroundColor: '#e0e7ff', 
                        color: '#4f46e5', 
                        border: '1px solid #c7d2fe',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <FileSpreadsheet size={16} /> Update Candidate
                </button>
             </div>

             <button 
                onClick={() => onDelete(employee.candidateId, employee.fullName, employee.companyId, employee.positionCode)} 
                className="btn btn-danger"
             >
                Delete Application
             </button>
          </div>
        </div>
      </div>
    );
};

export default EmployeeDetailsModal;