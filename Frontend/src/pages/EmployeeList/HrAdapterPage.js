// fileName: src/pages/EmployeeList/HrAdapterPage.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileSpreadsheet, ArrowLeft, Loader, DatabaseBackup } from "lucide-react";
import toast from "react-hot-toast";

// --- REUSABLE COMPONENTS (Defined outside to prevent losing focus) ---

const FormField = ({ label, name, type = "text", req, max, colSpan = 1, formData, onChange, readOnly = false }) => {
    const value = formData[name] !== undefined && formData[name] !== null ? formData[name] : "";
    const isEmpty = value === "" || value === null;
    
    return (
        <div className={`field ${colSpan > 1 ? 'full-width-field' : ''}`}>
            <label style={{ color: isEmpty ? '#ef4444' : undefined }}>
                {label} <span style={{ color: isEmpty ? '#fca5a5' : '#9ca3af', fontWeight: '400' }}>({name})</span> {req && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                maxLength={max}
                readOnly={readOnly}
                style={{
                    ...(req && isEmpty ? { borderColor: "#fca5a5" } : {}),
                    ...(readOnly ? { backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" } : {})
                }}
            />
        </div>
    );
};

const FormSelect = ({ label, name, req, options = [], colSpan = 1, formData, onChange }) => {
    const value = formData[name] || "";
    const isEmpty = !value || value === "";

    return (
        <div className={`field ${colSpan > 1 ? 'full-width-field' : ''}`}>
            <label style={{ color: isEmpty ? '#ef4444' : undefined }}>
                {label} <span style={{ color: isEmpty ? '#fca5a5' : '#9ca3af', fontWeight: '400' }}>({name})</span> {req && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <select 
                name={name} 
                value={value} 
                onChange={onChange}
                style={req && isEmpty ? { borderColor: "#fca5a5" } : {}}
            >
                <option value="" disabled>Select {label}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const HrAdapterPage = () => {
    const { companyId, candidateId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [dropdowns, setDropdowns] = useState({
        company: [], job: [], grade: [], empType: [], division: [],
        branch: [], department: [], section: [], unit: [],
        payGroup: [], epf: [], socso: [], statutory: [],
        pcb: [], ve: [], security: [], pension: [], gl1: [], gl2: []
    });

    // --- 1. FETCH FULL DATA & MAP TO SCHEMA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) throw new Error("No token found");

                const get = async (endpoint) => {
                    const res = await fetch(`/api/companies/${encodeURIComponent(companyId)}/${endpoint}/${encodeURIComponent(candidateId)}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (!res.ok && res.status !== 404) throw new Error(`Failed to fetch ${endpoint}`);
                    return res.status === 404 ? {} : await res.json();
                };

                const fetchOptionsMap = async (tableName) => {
                    try {
                        const res = await fetch(`/api/companies/${encodeURIComponent(companyId)}/AdminUpdate/options/${tableName}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!res.ok) return [];
                        const data = await res.json();
                        return data.map(item => {
                            const code = item.code || item.Code || "";
                            const desc = item.description || item.Description || item.name || item.Name || "";
                            
                            // Specific mapping for cascading dropdown statutory_code
                            if (tableName === 'statutory_code') {
                                return {
                                    value: String(code).trim(),
                                    label: String(code).trim(),          
                                    companyCode: String(desc).trim()     
                                };
                            }

                            return {
                                value: String(code).trim(),
                                label: (desc && desc !== code) ? `${String(code).trim()} - ${String(desc).trim()}` : String(code).trim()
                            };
                        });
                    } catch { return []; }
                };

                const [
                    rawBasic, rawContact, existingHrData,
                    companyOpts, jobOpts, gradeOpts, empTypeOpts, divisionOpts, branchOpts,
                    deptOpts, sectionOpts, unitOpts, payGroupOpts, epfOpts, socsoOpts,
                    statutoryOpts, pcbOpts, veOpts, securityOpts, pensionOpts, gl1Opts, gl2Opts
                ] = await Promise.all([
                    get('candidates'), get('contact'), get('HrAdapter'),
                    fetchOptionsMap('company_code'), fetchOptionsMap('job_codes'),
                    fetchOptionsMap('job_grade_code'), fetchOptionsMap('empty_code'),
                    fetchOptionsMap('division_code'), fetchOptionsMap('branch_code'),
                    fetchOptionsMap('department_code'), fetchOptionsMap('section_code'),
                    fetchOptionsMap('unit_code'), fetchOptionsMap('pay_group_code'),
                    fetchOptionsMap('epf_code'), fetchOptionsMap('socso_code'),
                    fetchOptionsMap('statutory_code'), fetchOptionsMap('pcb_code'),
                    fetchOptionsMap('ve_code'), fetchOptionsMap('security_code'),
                    fetchOptionsMap('pension_code'), fetchOptionsMap('gl1_code'), fetchOptionsMap('gl2_code')
                ]);

                // Store Dropdowns in state
                setDropdowns({
                    company: companyOpts, job: jobOpts, grade: gradeOpts, empType: empTypeOpts, 
                    division: divisionOpts, branch: branchOpts, department: deptOpts, 
                    section: sectionOpts, unit: unitOpts, payGroup: payGroupOpts, 
                    epf: epfOpts, socso: socsoOpts, statutory: statutoryOpts, 
                    pcb: pcbOpts, ve: veOpts, security: securityOpts, 
                    pension: pensionOpts, gl1: gl1Opts, gl2: gl2Opts
                });

                const basic = rawBasic && (rawBasic.profile || rawBasic.Profile) ? (rawBasic.profile || rawBasic.Profile) : rawBasic;
                const contact = rawContact && (rawContact.profile || rawContact.Profile) ? (rawContact.profile || rawContact.Profile) : rawContact;

                const getValue = (obj, key) => {
                    if (!obj) return '';
                    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
                    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                    if (obj[pascalKey] !== undefined && obj[pascalKey] !== null && obj[pascalKey] !== '') return obj[pascalKey];
                    return '';
                };

                const val = (v, max) => String(v || "").substring(0, max);
                const dateVal = (d) => {
                    if (!d) return "";
                    try { return new Date(d).toISOString().split('T')[0]; } 
                    catch { return ""; }
                };
                
                const basicGender = getValue(basic, 'gender');
                const basicMarital = getValue(basic, 'maritalStatusCode');
                const basicBirthDate = getValue(basic, 'birthDate');
                const basicNativeStatus = getValue(basic, 'nativeStatus');

                const mapGender = (g) => String(g || "").toLowerCase().includes("female") ? "F" : "M";
                const mapMarital = (m) => {
                    const s = String(m || "").toLowerCase();
                    return s.includes("married") ? "M" : s.includes("divorce") ? "D" : "S";
                };
                const mapNative = (n) => String(n || "").toLowerCase() === "native" ? "Y" : "N";

                const effectiveDate = new Date().toISOString().split('T')[0];
                const birthDateFormatted = dateVal(basicBirthDate);
                const birthMonthExtracted = basicBirthDate ? new Date(basicBirthDate).getMonth() + 1 : 1;

                let finalFormData = {
                    BPOEFDT: effectiveDate,
                    PERSONID: "", 
                    NAME: val(getValue(basic, 'fullName'), 60),
                    FIRSTNAME: val(getValue(basic, 'firstName'), 20), 
                    MIDDLENAME: val(getValue(basic, 'middleName'), 20),
                    LASTNAME: val(getValue(basic, 'lastName'), 20),
                    ALIAS: "",
                    SECGRPID: "", 
                    RECLEVEL: "", 
                    YRSVDT: effectiveDate, 
                    GRPJOINDT: effectiveDate, 
                    IC: val(getValue(basic, 'oldIcNumber'), 20),
                    NEWIC: val(getValue(basic, 'newIcNumber'), 20),
                    SEX: mapGender(basicGender),
                    RACECODE: val(getValue(basic, 'raceCode') || "MALAY", 6),
                    RELIGNCODE: val(getValue(basic, 'religionCode') || "ISLAM", 6),
                    NATIONCODE: val(getValue(basic, 'nationalityCode') || "MYS", 6),   
                    MARSTACODE: mapMarital(basicMarital),
                    CORRADDR: val(getValue(contact, 'correspondenceAddress'), 250),
                    CORRTELNO: val(getValue(contact, 'phoneNumber'), 20),
                    PERMADDR: val(getValue(contact, 'permanentAddress'), 250),
                    PERMTELNO: val(getValue(contact, 'permanentPhone'), 20),
                    EMAILADDR: val(getValue(basic, 'email') || getValue(contact, 'email'), 50),
                    PASSPORTNO: val(getValue(basic, 'passport'), 50),
                    CTYORGCODE: val(getValue(basic, 'countryOfOriginCode') || "MYS", 6),
                    DATEBIRTH: birthDateFormatted,
                    BIRTHMONTH: birthMonthExtracted,
                    ISNATIVE: mapNative(basicNativeStatus), 
                    RETIREDT: "",
                    SALUTATION: val(getValue(basic, 'salutationCode') || getValue(basic, 'salutationDescription'), 10),
                    PHYDEFECTS: "", 
                    EMCYNAME: val(getValue(contact, 'emergencyContactName'), 60), 
                    EMCYADDR: val(getValue(contact, 'emergencyAddress'), 254),
                    EMCYTELNO: val(getValue(contact, 'emergencyPhone'), 15),
                    OFFTELNO: val(getValue(contact, 'officeNumber'), 15),
                    HPTELNO: val(getValue(contact, 'phoneNumber'), 15),
                    OTHTELNO: val(getValue(contact, 'otherNumber'), 15), 
                    PERMARRYDT: "",
                    PERHEIGHT: "",
                    PERWEIGHT: "",
                    COMPNYCODE: val(getValue(basic, 'companyCode'), 6), 
                    DUECONFIRM1: "",
                    DUECONFIRM2: "",
                    CONFIRMDT: "",
                    CONTRACTDUE: "",
                    VISAEXPIRY: "",
                    PERMITDUE: "",
                    EPFICIND: "",
                    STFEPFFIXDEDT: "", 
                    COEPFFIXDEDT: "",  
                    SOCCATCODE: "",
                    PCBCATCODE: "",
                    COEPFREFCODE: "",
                    COSOCSOREFCODE: "",
                    COTAXREFCODE: "",
                    COPAYTAX: "", 
                    EPFINITIAL: "",
                    GLSEG1CODE: "",
                    GLSEG2CODE: "",
                    PERMITNO: "",
                    PAYMODE: "BANK", 
                    COMMODE: "MONTHLY", 
                    VECODE: "",
                    EPFCODE: "",
                    ISHEADCNT: "Y", 
                    PESNCODE: "",
                    PAYGRPCODE: "",
                    PROBMTH: 0, 
                    HIREPOSTYPE: "N", 
                    NPAGMTYPCODE: "",
                    NPAGMMBRCODE: "",
                    JOBCODE: val(getValue(basic, 'positionCode'), 6),
                    GRADECODE: "", 
                    EMPTYPCODE: "",
                    DIVSNCODE: "", 
                    BRHLOCCODE: "", 
                    DEPTCODE: "",
                    SECTIOCODE: "", 
                    UNITCODE: "",
                    BASICAMT: "",
                    STAFFNO: ""
                };

                // Merge with saved database data if it exists. Check both cases to be bulletproof.
                const savedJsonString = existingHrData?.formDataJson || existingHrData?.FormDataJson;
                if (savedJsonString) {
                    try {
                        const savedData = JSON.parse(savedJsonString);
                        finalFormData = { ...finalFormData, ...savedData };
                    } catch (e) {
                        console.error("Failed to parse saved HR Adapter data", e);
                    }
                }

                setFormData(finalFormData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load candidate data.");
                setLoading(false);
            }
        };

        if (candidateId && companyId) fetchData();
    }, [candidateId, companyId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value ? Number(value) : "" }));
        } else if (name === 'DATEBIRTH') {
            const date = new Date(value);
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                BIRTHMONTH: !isNaN(date.getTime()) ? date.getMonth() + 1 : prev.BIRTHMONTH 
            }));
        } else if (name === 'COMPNYCODE') {
            // Reset cascading fields when parent code changes
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                COEPFREFCODE: "",
                COSOCSOREFCODE: "",
                COTAXREFCODE: ""
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- 2. HANDLE SAVE TO DATABASE ---
    const handleSave = async () => {
        // --- 1. REQUIRED FIELDS VALIDATION START ---
        const requiredFields = [
            'BPOEFDT', 'PERSONID', 'NAME', 'SEX', 'MARSTACODE', 'RACECODE', 
            'RELIGNCODE', 'NATIONCODE', 'CTYORGCODE', 'BIRTHMONTH', 'ISNATIVE', 
            'CORRADDR', 'PERMADDR', 'COMPNYCODE', 'JOBCODE', 'GRADECODE', 
            'EMPTYPCODE', 'DIVSNCODE', 'BRHLOCCODE', 'DEPTCODE', 'SECTIOCODE', 
            'UNITCODE', 'YRSVDT', 'GRPJOINDT', 'PROBMTH', 'HIREPOSTYPE', 
            'BASICAMT', 'PAYGRPCODE', 'PAYMODE', 'COMMODE', 'EPFICIND', 
            'STFEPFFIXDEDT', 'COEPFFIXDEDT', 'SOCCATCODE', 'PCBCATCODE', 
            'COPAYTAX', 'SECGRPID', 'RECLEVEL', 'ISHEADCNT'
        ];

        const missingFields = requiredFields.filter(field => 
            formData[field] === undefined || 
            formData[field] === null || 
            String(formData[field]).trim() === ""
        );

        if (missingFields.length > 0) {
            toast.error(`Cannot save. Please fill in all required fields. (${missingFields.length} missing)`, { duration: 4000 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return; 
        }
        // --- 1. REQUIRED FIELDS VALIDATION END ---

        setIsSaving(true);
        const toastId = toast.loading("Validating and saving data...");

        try {
            const token = localStorage.getItem("authToken");

            // --- 2. STAFFNO ASSIGNMENT & DUPLICATE CHECK ---
            let finalStaffNo = formData.STAFFNO ? String(formData.STAFFNO).trim() : "";
            
            // If empty, fallback to PERSONID
            if (!finalStaffNo) {
                finalStaffNo = formData.PERSONID ? String(formData.PERSONID).trim() : "";
            }

            if (!finalStaffNo) {
                throw new Error("Cannot determine Staff No. Person ID is missing.");
            }

            // Check if StaffNo exists in the system
            const checkUrl = `/api/companies/${encodeURIComponent(companyId)}/employees/check-staffno/${encodeURIComponent(finalStaffNo)}`;
            const checkRes = await fetch(checkUrl, { headers: { "Authorization": `Bearer ${token}` } });
            
            if (checkRes.ok) {
                const data = await checkRes.json();
                if (data === true || data.exists || data.isDuplicate) {
                    throw new Error(`Staff No '${finalStaffNo}' already exists in the system.`);
                }
            } else if (checkRes.status === 409) {
                throw new Error(`Staff No '${finalStaffNo}' already exists in the system.`);
            }

            // Update formData with the resolved final Staff No before saving
            const updatedFormData = { ...formData, STAFFNO: finalStaffNo };

            // Update state so the form shows the assigned STAFFNO visually
            setFormData(updatedFormData);

            // --- 3. SAVE THE DATA ---
            const res = await fetch(`/api/companies/${encodeURIComponent(companyId)}/HrAdapter/${encodeURIComponent(candidateId)}`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    formDataJson: JSON.stringify(updatedFormData)
                })
            });

            if (!res.ok) throw new Error("Failed to save data to the server.");
            
            // UPDATED TOAST: Confirm Profile Status is updated
            toast.success("HR Adapter Data saved & Profile Status updated!", { id: toastId });
            
            // Wait 1.5 seconds, then return to the employee list automatically
            setTimeout(() => {
                navigate(-1);
            }, 1500);
            
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(error.message || "Failed to save.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Dynamic Filtering for Cascading Dropdowns ---
    const statutoryOptions = formData.COMPNYCODE 
        ? dropdowns.statutory.filter(opt => 
            opt.companyCode && 
            opt.companyCode.toUpperCase() === formData.COMPNYCODE.toUpperCase()
          )
        : [];

    if (loading) return <div className="loading"><Loader className="spinner" /></div>;

    return (
        <div>
            <button 
                onClick={() => navigate(-1)} 
                style={{
                    display:'flex', alignItems:'center', gap:'8px', border:'none', 
                    background:'none', cursor:'pointer', marginBottom:'16px', 
                    color:'#6b7280', fontWeight:'600'
                }}
            >
                <ArrowLeft size={20} /> Back to List
            </button>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={20} /> HR Adapter Form (BPO New Join)
                    </h2>
                    <p className="card-subtitle">Complete all required fields below to map candidate data into the HRSC database structure.</p>
                </div>

                <div className="form-content-area">
                    <div className="grid">
                        
                        {/* --- IDENTIFICATION --- */}
                        <div className="full-width-field form-section">
                            <h3>Identification & Naming</h3>
                        </div>
                        <FormField name="BPOEFDT" label="Effective Date" type="date" req formData={formData} onChange={handleChange} />
                        <FormField name="PERSONID" label="Person ID" req max={10} formData={formData} onChange={handleChange} />
                        <FormField name="NAME" label="Person Name" req max={60} colSpan={2} formData={formData} onChange={handleChange} />
                        <FormField name="FIRSTNAME" label="First Name" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="MIDDLENAME" label="Middle Name" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="LASTNAME" label="Last Name" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="ALIAS" label="Alias" max={60} formData={formData} onChange={handleChange} />
                        <FormField name="SALUTATION" label="Salutation" max={10} formData={formData} onChange={handleChange} />
                        <FormField name="IC" label="Old IC" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="NEWIC" label="New IC" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="PASSPORTNO" label="Passport" max={50} formData={formData} onChange={handleChange} />
                        <FormField name="STAFFNO" label="Staff No" max={10} formData={formData} onChange={handleChange} />

                        {/* --- DEMOGRAPHICS --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Demographics & Physical</h3>
                        </div>
                        <FormField name="SEX" label="Gender (M/F)" req max={1} formData={formData} onChange={handleChange} />
                        <FormField name="MARSTACODE" label="Marital Status Code" req max={6} formData={formData} onChange={handleChange} />
                        <FormField name="RACECODE" label="Race Code" req max={6} formData={formData} onChange={handleChange} />
                        <FormField name="RELIGNCODE" label="Religion Code" req max={6} formData={formData} onChange={handleChange} />
                        <FormField name="NATIONCODE" label="Nationality Code" req max={6} formData={formData} onChange={handleChange} />
                        <FormField name="CTYORGCODE" label="Country Origin Code" req max={6} formData={formData} onChange={handleChange} />
                        <FormField name="DATEBIRTH" label="Date of Birth" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="BIRTHMONTH" label="Birth Month" type="number" req formData={formData} onChange={handleChange} readOnly={true} />
                        <FormField name="ISNATIVE" label="Is Native (Y/N)" req max={1} formData={formData} onChange={handleChange} />
                        <FormField name="PERMARRYDT" label="Marriage Date" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="PERHEIGHT" label="Height" type="number" formData={formData} onChange={handleChange} />
                        <FormField name="PERWEIGHT" label="Weight" type="number" formData={formData} onChange={handleChange} />
                        <FormField name="PHYDEFECTS" label="Physical Defects" max={254} colSpan={2} formData={formData} onChange={handleChange} />

                        {/* --- CONTACT --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Contact Information</h3>
                        </div>
                        <FormField name="CORRADDR" label="Correspondence Address" req max={250} colSpan={2} formData={formData} onChange={handleChange} />
                        <FormField name="CORRTELNO" label="Correspondence Phone No." max={20} formData={formData} onChange={handleChange} />
                        <FormField name="EMAILADDR" label="Email Address" max={50} formData={formData} onChange={handleChange} />
                        <FormField name="PERMADDR" label="Permanent Address" req max={250} colSpan={2} formData={formData} onChange={handleChange} />
                        <FormField name="PERMTELNO" label="Permanent Phone No." max={20} formData={formData} onChange={handleChange} />
                        <FormField name="OFFTELNO" label="Office Tel No" max={15} formData={formData} onChange={handleChange} />
                        <FormField name="HPTELNO" label="Mobile/HP Number" max={15} formData={formData} onChange={handleChange} />
                        <FormField name="OTHTELNO" label="Other Phone No" max={15} formData={formData} onChange={handleChange} />

                        {/* --- EMERGENCY --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Emergency Contact</h3>
                        </div>
                        <FormField name="EMCYNAME" label="Emergency Contact Name" max={60} formData={formData} onChange={handleChange} />
                        <FormField name="EMCYTELNO" label="Emergency Telephone" max={15} formData={formData} onChange={handleChange} />
                        <FormField name="EMCYADDR" label="Emergency Address" max={254} colSpan={2} formData={formData} onChange={handleChange} />

                        {/* --- EMPLOYMENT & JOB --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Employment & Job Placement</h3>
                        </div>
                        
                        <FormSelect name="COMPNYCODE" label="Company Code" req formData={formData} onChange={handleChange} options={dropdowns.company} />
                        <FormSelect name="JOBCODE" label="Job Code" req formData={formData} onChange={handleChange} options={dropdowns.job} />
                        <FormSelect name="GRADECODE" label="Grade Code" req formData={formData} onChange={handleChange} options={dropdowns.grade} />
                        <FormSelect name="EMPTYPCODE" label="Employment Type Code" req formData={formData} onChange={handleChange} options={dropdowns.empType} />
                        <FormSelect name="DIVSNCODE" label="Division Code" req formData={formData} onChange={handleChange} options={dropdowns.division} />
                        <FormSelect name="BRHLOCCODE" label="Branch Code" req formData={formData} onChange={handleChange} options={dropdowns.branch} />
                        <FormSelect name="DEPTCODE" label="Department Code" req formData={formData} onChange={handleChange} options={dropdowns.department} />
                        <FormSelect name="SECTIOCODE" label="Section Code" req formData={formData} onChange={handleChange} options={dropdowns.section} />
                        <FormSelect name="UNITCODE" label="Unit Code" req formData={formData} onChange={handleChange} options={dropdowns.unit} />
                        
                        <FormField name="YRSVDT" label="Year of Service Date" type="date" req formData={formData} onChange={handleChange} />
                        <FormField name="GRPJOINDT" label="Group Join Date" type="date" req formData={formData} onChange={handleChange} />
                        <FormField name="PROBMTH" label="Probation Months" type="number" req formData={formData} onChange={handleChange} />
                        
                        <FormSelect 
                            name="HIREPOSTYPE" label="Hire Position Type" req formData={formData} onChange={handleChange} 
                            options={[{label: 'N - NEW', value: 'N'}, {label: 'R - REPLACEMENT', value: 'R'}]} 
                        />
                        
                        <FormField name="DUECONFIRM1" label="Due Confirm 1" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="DUECONFIRM2" label="Due Confirm 2" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="CONFIRMDT" label="Confirmation Date" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="RETIREDT" label="Retire Date" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="CONTRACTDUE" label="Contract Due Date" type="date" formData={formData} onChange={handleChange} />

                        {/* --- PAYROLL & FINANCIAL --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Payroll, Tax & Statutory</h3>
                        </div>
                        <FormField name="BASICAMT" label="Basic Salary Amount" type="number" req formData={formData} onChange={handleChange} />
                        
                        <FormSelect name="PAYGRPCODE" label="Payroll Group Code" req formData={formData} onChange={handleChange} options={dropdowns.payGroup} />
                        
                        <FormSelect 
                            name="PAYMODE" label="Payment Mode" req formData={formData} onChange={handleChange} 
                            options={[
                                {label: 'BANK', value: 'BANK'}, 
                                {label: 'CHEQUE', value: 'CHEQUE'}, 
                                {label: 'CASH', value: 'CASH'}, 
                                {label: 'HOLD', value: 'HOLD'}
                            ]} 
                        />
                        <FormSelect 
                            name="COMMODE" label="Computation Mode" req formData={formData} onChange={handleChange} 
                            options={[
                                {label: 'MONTHLY', value: 'MONTHLY'}, 
                                {label: 'DAILY', value: 'HOURLY'}
                            ]} 
                        />
                        
                        <FormSelect 
                            name="EPFICIND" label="IC Indicator (O/N)" req formData={formData} onChange={handleChange} 
                            options={[{label: 'O - OLD', value: 'O'}, {label: 'N - NEW', value: 'N'}]} 
                        />
                        
                        <FormSelect name="EPFCODE" label="EPF Group Code" formData={formData} onChange={handleChange} options={dropdowns.epf} />
                        
                        <FormField name="EPFINITIAL" label="EPF Initial" max={3} formData={formData} onChange={handleChange} />
                        
                        {/* --- CASCADING DROPDOWNS START --- */}
                        <FormSelect name="COEPFREFCODE" label="Company EPF Ref Code" formData={formData} onChange={handleChange} options={statutoryOptions} />
                        {/* --- CASCADING DROPDOWNS END --- */}

                        <FormField name="STFEPFFIXDEDT" label="Staff EPF Fix Deduct" type="number" req formData={formData} onChange={handleChange} />
                        <FormField name="COEPFFIXDEDT" label="Company EPF Fix Deduct" type="number" req formData={formData} onChange={handleChange} />
                        
                        <FormSelect name="SOCCATCODE" label="SOCSO Category Code" req formData={formData} onChange={handleChange} options={dropdowns.socso} />
                        
                        {/* --- CASCADING DROPDOWNS START --- */}
                        <FormSelect name="COSOCSOREFCODE" label="Company SOCSO Ref Code" formData={formData} onChange={handleChange} options={statutoryOptions} />
                        {/* --- CASCADING DROPDOWNS END --- */}

                        <FormSelect name="PCBCATCODE" label="PCB Category Code" req formData={formData} onChange={handleChange} options={dropdowns.pcb} />
                        
                        {/* --- CASCADING DROPDOWNS START --- */}
                        <FormSelect name="COTAXREFCODE" label="Company Tax Ref Code" formData={formData} onChange={handleChange} options={statutoryOptions} />
                        {/* --- CASCADING DROPDOWNS END --- */}
                        
                        <FormSelect 
                            name="COPAYTAX" label="Company Pay Tax (Y/N)" req formData={formData} onChange={handleChange} 
                            options={[{label: 'Y - YES', value: 'Y'}, {label: 'N - NO', value: 'N'}]} 
                        />
                        
                        <FormSelect name="VECODE" label="EPF VE Group Code" formData={formData} onChange={handleChange} options={dropdowns.ve} />

                        {/* --- FOREIGN WORKER --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>Foreign Worker Info</h3>
                        </div>
                        <FormField name="PERMITNO" label="Permit No" max={20} formData={formData} onChange={handleChange} />
                        <FormField name="PERMITDUE" label="Permit Due Date" type="date" formData={formData} onChange={handleChange} />
                        <FormField name="VISAEXPIRY" label="Visa Expiry Date" type="date" formData={formData} onChange={handleChange} />

                        {/* --- SYSTEM CODES --- */}
                        <div className="full-width-field form-section" style={{ marginTop: '20px' }}>
                            <h3>System & Integration Codes</h3>
                        </div>
                        
                        <FormSelect name="SECGRPID" label="Security Access Group Code" req formData={formData} onChange={handleChange} options={dropdowns.security} />
                        
                        <FormSelect 
                            name="RECLEVEL" 
                            label="Security Level" 
                            req 
                            formData={formData} 
                            onChange={handleChange} 
                            options={[
                                { label: '1', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3', value: '3' },
                                { label: '4', value: '4' },
                                { label: '5', value: '5' },
                                { label: '6', value: '6' },
                                { label: '7', value: '7' },
                                { label: '8', value: '8' },
                                { label: '9', value: '9' }
                            ]} 
                        />
                        
                        <FormSelect 
                            name="ISHEADCNT" label="Is Headcount" req formData={formData} onChange={handleChange} 
                            options={[{label: 'Y - YES', value: 'Y'}, {label: 'N - NO', value: 'N'}]} 
                        />
                        
                        <FormSelect name="PESNCODE" label="Pension Code" formData={formData} onChange={handleChange} options={dropdowns.pension} />
                        <FormSelect name="GLSEG1CODE" label="HRSC GL Accounting Code One" formData={formData} onChange={handleChange} options={dropdowns.gl1} />
                        <FormSelect name="GLSEG2CODE" label="HRSC GL Accounting Code Two" formData={formData} onChange={handleChange} options={dropdowns.gl2} />
                        
                        <FormField name="NPAGMTYPCODE" label="Non-Pinch Agreement Type" max={10} formData={formData} onChange={handleChange} />
                        <FormField name="NPAGMMBRCODE" label="Non-Pinch Agreement Member Code" max={10} formData={formData} onChange={handleChange} />

                    </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button type="button" onClick={() => navigate(-1)} className="btn">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="btn btn-primary" 
                        style={{ 
                            display: "flex", alignItems: "center", gap: "8px", 
                            opacity: isSaving ? 0.7 : 1, cursor: isSaving ? "not-allowed" : "pointer"
                        }}
                    >
                        <DatabaseBackup size={18} /> {isSaving ? "Saving..." : "Save Data"}
                    </button>
                </div>
            </div>

            <style>{`
                /* Target webkit browsers (Chrome, Safari, Edge) */
                input[type="number"]::-webkit-inner-spin-button, 
                input[type="number"]::-webkit-outer-spin-button { 
                    -webkit-appearance: none !important; 
                    margin: 0 !important; 
                }
                /* Target Firefox */
                input[type="number"] {
                    -moz-appearance: textfield !important;
                }
            `}</style>
        </div>
    );
};

export default HrAdapterPage;