// fileName: ReviewPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Phone, Briefcase, GraduationCap, Star, BookOpen, MapPin, FileText } from 'lucide-react';

// --- Helper Component for Displaying Data ---
const DisplayField = ({ label, value, fullWidth = false, isSectionTitle = false }) => {
    if (isSectionTitle) {
        return <h4 className="review-section-subtitle">{label}</h4>;
    }
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return (
        <div className={`field review-field ${fullWidth ? 'full-width-field' : ''}`}>
            <label>{label}:</label>
            <p>{value || '-'}</p>
        </div>
    );
};

// --- Reusable Section Component ---
const ReviewSection = ({ title, icon, editPath, children }) => {
    const navigate = useNavigate();

    return (
        <div className="form-section">
            <h3 className="review-section-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon} {title}
                </span>
                <button onClick={() => navigate(editPath)} className="btn-edit-inline">
                    Edit
                </button>
            </h3>
            {children}
        </div>
    );
};

const fetchReviewData = async (candidateId) => {
    const companyId = localStorage.getItem('companyId') || '';
    if (!companyId) throw new Error("Company context missing.");

    const tenantPath = `/api/companies/${encodeURIComponent(companyId)}`;
    const token = localStorage.getItem('authToken');

    const safeFetch = async (controller) => {
        try {
            const url = `${tenantPath}/${controller}/${candidateId}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 404 || res.status === 204) return null; 
                throw new Error(`Error ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            console.warn(`Failed to fetch ${controller}`, err);
            return null; 
        }
    };

    const safeFetchList = async (controller) => {
        const res = await safeFetch(controller);
        return Array.isArray(res) ? res : [];
    };

    // Helper to fetch Dropdown Option Maps to guarantee names over codes
    const fetchOptionsMap = async (tableName) => {
        try {
            const url = `${tenantPath}/AdminUpdate/options/${tableName}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) return {};
            const data = await res.json();
            const map = {};
            data.forEach(item => {
                const code = item.code || item.Code;
                const desc = item.description || item.Description || item.name || item.Name;
                if (code) map[code] = desc;
            });
            return map;
        } catch {
            return {};
        }
    };

    try {
        // Fetch User Data and Dropdown Maps Concurrently for maximum speed
        const [
            rawBasic, contact, quals, jobs, skills, hobbyLangData, fieldExps,
            salutations, maritalStatuses, races, religions, nationalities, countries,
            industries, jobTitles, cessations, hobbyMap, langMap, fieldAreaMap, qualMap, gradeMap
        ] = await Promise.all([
            safeFetch('candidates'),
            safeFetch('contact'),
            safeFetchList('Qualification'),
            safeFetchList('EmploymentHistory'),
            safeFetch('Skill'),
            safeFetch('HobbyLanguage'),
            safeFetchList('FieldExperience'),
            
            // Dropdown Maps
            fetchOptionsMap('salutation_code'), fetchOptionsMap('marital_status_codes'), fetchOptionsMap('race_codes'),
            fetchOptionsMap('religion_codes'), fetchOptionsMap('nationality_codes'), fetchOptionsMap('country_origin_codes'),
            fetchOptionsMap('industry_codes'), fetchOptionsMap('job_codes'), fetchOptionsMap('cessation_reasons'),
            fetchOptionsMap('hobby_codes'), fetchOptionsMap('language_codes'), fetchOptionsMap('field_area_codes'),
            fetchOptionsMap('qualification_codes'), fetchOptionsMap('qualification_grades')
        ]);

        // Unwrap data because backend returns { Profile: {...} } or { profile: {...} }
        const basic = rawBasic && (rawBasic.profile || rawBasic.Profile) 
            ? (rawBasic.profile || rawBasic.Profile) 
            : rawBasic;

        // ✅ HELPER: Safely extracts a value considering both camelCase and PascalCase
        const getValue = (obj, key) => {
            if (!obj) return '';
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
            if (obj[pascalKey] !== undefined && obj[pascalKey] !== null && obj[pascalKey] !== '') return obj[pascalKey];
            return '';
        };

        // ✅ HELPER: Maps code to description using the fetched dictionary map
        const getMappedName = (obj, codeKeys, descKey, map) => {
            let code = '';
            if (Array.isArray(codeKeys)) {
                for (let k of codeKeys) {
                    code = getValue(obj, k);
                    if (code) break;
                }
            } else {
                code = getValue(obj, codeKeys);
            }
            
            const desc = getValue(obj, descKey);
            
            // 1. If we have a code and it exists in the fetched dropdown map, use that!
            if (code && map[code]) return map[code];
            
            // 2. Otherwise fallback to the description from the backend (if any)
            if (desc) return desc;
            
            // 3. Final fallback: just display the code itself
            return code || '-';
        };

        const REC_TYPE_MAP = {
            'EMPLOYEE': 'Employee Referral',
            'COLLEGE': 'College / University',
            'AGENCY': 'Agency',
            'ADVERTISEMENT': 'Advertisement',
            'OTHERS': 'Others'
        };

        return {
            basicInfo: basic ? {
                candidateId: getValue(basic, 'candidateId'),
                firstName: getValue(basic, 'firstName'),
                middleName: getValue(basic, 'middleName'),
                lastName: getValue(basic, 'lastName'),
                fullName: getValue(basic, 'fullName'),
                salutation: getMappedName(basic, 'salutationCode', 'salutationDescription', salutations),
                entryDate: getValue(basic, 'entryDate') ? new Date(getValue(basic, 'entryDate')).toLocaleDateString() : '',
                newIcNumber: getValue(basic, 'newIcNumber'),
                oldIcNumber: getValue(basic, 'oldIcNumber'),
                passport: getValue(basic, 'passport'),
                birthDate: getValue(basic, 'birthDate') ? new Date(getValue(basic, 'birthDate')).toLocaleDateString() : '',
                gender: getValue(basic, 'genderDescription') || getValue(basic, 'gender'),
                maritalStatus: getMappedName(basic, 'maritalStatusCode', 'maritalStatusDescription', maritalStatuses),
                race: getMappedName(basic, 'raceCode', 'raceDescription', races),
                nativeStatus: getValue(basic, 'nativeStatus'),
                religion: getMappedName(basic, 'religionCode', 'religionDescription', religions),
                nationality: getMappedName(basic, 'nationalityCode', 'nationalityDescription', nationalities),
                countryOfOrigin: getMappedName(basic, 'countryOfOriginCode', 'countryOfOriginDescription', countries),
                recommendationType: REC_TYPE_MAP[getValue(basic, 'recommendationType')] || getValue(basic, 'recommendationType'),
                recommendationDetails: getValue(basic, 'recommendationDetails'),
                disability: getValue(basic, 'disability'),
            } : {},
            
            contactInfo: contact ? {
                email: getValue(contact, 'email'),
                phoneNumber: getValue(contact, 'phoneNumber'),
                officeNumber: getValue(contact, 'officeNumber'),
                otherNumber: getValue(contact, 'otherNumber'),
                correspondenceAddress: getValue(contact, 'correspondenceAddress'),
                correspondencePhone: getValue(contact, 'correspondencePhone'),
                permanentAddress: getValue(contact, 'permanentAddress'),
                permanentPhone: getValue(contact, 'permanentPhone'),
                emergencyContactName: getValue(contact, 'emergencyContactName'),
                emergencyPhone: getValue(contact, 'emergencyPhone'),
                emergencyAddress: getValue(contact, 'emergencyAddress'),
            } : {},
            
            qualifications: quals.map(q => ({
                schoolName: getValue(q, 'schoolName'),
                schoolTelNo: getValue(q, 'schoolTelNo'),
                schoolAddress: getValue(q, 'schoolAddress'),
                qualificationName: getMappedName(q, 'qualificationCode', 'qualificationName', qualMap), 
                qualificationSubName: getValue(q, 'qualificationSubName') || getValue(q, 'qualificationSubCode'),
                joinSchoolDate: getValue(q, 'joinSchoolDate') ? new Date(getValue(q, 'joinSchoolDate')).toLocaleDateString() : '',
                sinceWhenDate: getValue(q, 'sinceWhenDate') ? new Date(getValue(q, 'sinceWhenDate')).toLocaleDateString() : '',
                cgpa: getValue(q, 'cgpa'),
                qualificationGradeName: getMappedName(q, 'qualificationGradeCode', 'qualificationGradeName', gradeMap),
                qualificationGradeRank: getValue(q, 'qualificationGradeRank'),
                otherGradeInfo: getValue(q, 'otherGradeInfo'),
                isHighest: !!getValue(q, 'isHighest')
            })),
            
            employmentHistory: jobs.map(j => ({
                employerName: getValue(j, 'employerName'),
                telNo: getValue(j, 'telNo'),
                address: getValue(j, 'address'),
                jobName: getMappedName(j, 'jobCode', 'jobName', jobTitles),
                emphJobName: getValue(j, 'emphJobName'),
                industryDesc: getMappedName(j, 'industryCode', 'industryName', industries), 
                fromDate: getValue(j, 'fromDate') ? new Date(getValue(j, 'fromDate')).toLocaleDateString() : '',
                toDate: getValue(j, 'toDate') ? new Date(getValue(j, 'toDate')).toLocaleDateString() : 'Present',
                latest: !!getValue(j, 'latest'),
                startSalary: getValue(j, 'startSalary'),
                lastSalary: getValue(j, 'lastSalary'),
                jobFunction: getValue(j, 'jobFunction'),
                cessationDesc: getMappedName(j, ['cessationReasonCode', 'cessationReason'], 'cessationReasonDescription', cessations)
            })),
            
            skills: skills ? {
                officeSkill: getValue(skills, 'officeSkill') || getValue(skills, 'officeSkills'), 
                otherSkill: getValue(skills, 'otherSkill') || getValue(skills, 'otherRelevantSkills'),
                otherInfo: getValue(skills, 'otherInfo') || getValue(skills, 'otherSkillInformation'),
            } : {},
            
            hobbiesAndLanguages: {
                hobbies: (getValue(hobbyLangData, 'hobbies') || []).map(h => ({
                    hobbyName: getMappedName(h, 'hobbyCode', 'hobbyName', hobbyMap), 
                    abilityLevel: getValue(h, 'abilityLevel'),
                    localDescription: getValue(h, 'localDescription')
                })),
                languages: (getValue(hobbyLangData, 'languages') || []).map(l => ({
                    languageName: getMappedName(l, 'languageCode', 'languageName', langMap), 
                    readLevel: getValue(l, 'readLevel'),
                    writtenLevel: getValue(l, 'writtenLevel'),
                    spokenLevel: getValue(l, 'spokenLevel')
                })),
                resume: getValue(hobbyLangData, 'resume') ? {
                    fileName: getValue(getValue(hobbyLangData, 'resume'), 'fileName'),
                    entryDate: getValue(getValue(hobbyLangData, 'resume'), 'entryDate') ? new Date(getValue(getValue(hobbyLangData, 'resume'), 'entryDate')).toLocaleDateString() : ''
                } : null
            },
            
            fieldExperience: fieldExps.map(f => ({
                fieldAreaName: getMappedName(f, 'fieldAreaCode', 'fieldName', fieldAreaMap),
                yearInField: getValue(f, 'yearsOfExperience') || getValue(f, 'yearInField'), 
                remark: getValue(f, 'description') || getValue(f, 'remark') 
            }))
        };
    } catch (error) {
        console.error("Critical error building review data:", error);
        throw error;
    }
};

const ReviewPage = () => {
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            const storedId = localStorage.getItem("candidateId");
            if (!storedId) {
                 toast.error("Session expired. Please login again.");
                 navigate('/login');
                 return;
            }
            
            try {
                const data = await fetchReviewData(storedId);
                if (isMounted) setReviewData(data);
            } catch (error) { 
                if (isMounted) toast.error("Failed to load profile data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [navigate]);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading("Finalizing application...");

        try {
            const companyId = localStorage.getItem('companyId');
            const positionCode = localStorage.getItem('userPositionCode'); 
            const token = localStorage.getItem('authToken');

            if (!companyId) {
                toast.error("Error: Company Context Missing.", { id: toastId });
                setIsSubmitting(false);
                return;
            }

            if (!positionCode) {
                toast.success("Profile updated successfully! (No Job Application Created)", { id: toastId });
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/applications/${positionCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Application Submitted Successfully!", { id: toastId });
                localStorage.removeItem('userPositionCode'); 
                setTimeout(() => { navigate('/thanks'); }, 1000);
            } else {
                toast.error(data.message || "Submission failed.", { id: toastId });
            }
        } catch (error) {
            console.error("Submit Error:", error);
            toast.error("Network error. Please try again.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '20px', color: '#6b7280' }}>Gathering your information for review...</p>
            </div>
        );
    }

    if (!reviewData) {
        return <div className="error-message">Could not load data. Please reload the page.</div>;
    }

    const { basicInfo, contactInfo, skills, hobbiesAndLanguages, fieldExperience } = reviewData;

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Final Review ✅</h2>
                <p className="card-subtitle">Please review all your information carefully before confirmation.</p>
            </div>

            <div className="form-content-area review-page">
                <ReviewSection title="Basic Information" icon={<User size={18} />} editPath="/candidates/new">
                    {basicInfo && Object.keys(basicInfo).length > 0 ? (
                        <div className="grid">
                            <DisplayField label="Candidate ID" value={basicInfo.candidateId} />
                            <DisplayField label="First Name" value={basicInfo.firstName} />
                            <DisplayField label="Middle Name" value={basicInfo.middleName} />
                            <DisplayField label="Last Name" value={basicInfo.lastName} />
                            <DisplayField label="Full Name" value={basicInfo.fullName} />
                            <DisplayField label="Salutation" value={basicInfo.salutation} />
                            <DisplayField label="Entry Date" value={basicInfo.entryDate} />
                            <DisplayField label="New IC Number" value={basicInfo.newIcNumber} />
                            <DisplayField label="Passport" value={basicInfo.passport} />
                            <DisplayField label="Birth Date" value={basicInfo.birthDate} />
                            <DisplayField label="Gender" value={basicInfo.gender} />
                            <DisplayField label="Marital Status" value={basicInfo.maritalStatus} />
                            <DisplayField label="Race" value={basicInfo.race} />
                            <DisplayField label="Religion" value={basicInfo.religion} />
                            <DisplayField label="Nationality" value={basicInfo.nationality} />
                            <DisplayField label="Country of Origin" value={basicInfo.countryOfOrigin} />
                        </div>
                    ) : <p className="text-gray-500 italic">No basic information saved.</p>}
                </ReviewSection>
                
                <ReviewSection title="Contact Information" icon={<Phone size={18} />} editPath="/contact">
                    {contactInfo && Object.keys(contactInfo).length > 0 ? (
                        <>
                            <DisplayField isSectionTitle label="General Contact" />
                            <div className="grid">
                                <DisplayField label="Email" value={contactInfo.email} />
                                <DisplayField label="Personal Phone" value={contactInfo.phoneNumber} />
                                <DisplayField label="Office Phone" value={contactInfo.officeNumber} />
                            </div>
                            <DisplayField isSectionTitle label="Correspondence Address" />
                            <div className="grid">
                                <DisplayField label="Address" value={contactInfo.correspondenceAddress} fullWidth />
                                <DisplayField label="Phone" value={contactInfo.correspondencePhone} />
                            </div>
                            <DisplayField isSectionTitle label="Permanent Address" />
                            <div className="grid">
                                <DisplayField label="Address" value={contactInfo.permanentAddress} fullWidth />
                                <DisplayField label="Phone" value={contactInfo.permanentPhone} />
                            </div>
                            <DisplayField isSectionTitle label="Emergency Contact" />
                            <div className="grid">
                                <DisplayField label="Contact Name" value={contactInfo.emergencyContactName} />
                                <DisplayField label="Phone" value={contactInfo.emergencyPhone} />
                                <DisplayField label="Address" value={contactInfo.emergencyAddress} fullWidth />
                            </div>
                        </>
                    ) : <p className="text-gray-500 italic">No contact information saved.</p>}
                </ReviewSection>

                <ReviewSection title="Qualifications" icon={<GraduationCap size={18} />} editPath="/qualification">
                    {reviewData.qualifications.length > 0 ? reviewData.qualifications.map((qual, index) => (
                        <div key={`qual-${index}`} className="review-entry">
                            <DisplayField isSectionTitle label={`Qualification #${index + 1} ${qual.isHighest ? '(Highest)' : ''}`} />
                            <div className="grid">
                                <DisplayField label="School Name" value={qual.schoolName} />
                                <DisplayField label="Qualification" value={qual.qualificationName} />
                                <DisplayField label="Sub-Qualification" value={qual.qualificationSubName} />
                                <DisplayField label="CGPA / Score" value={qual.cgpa} />
                                <DisplayField label="Grade" value={qual.qualificationGradeName} />
                                <DisplayField label="Completion Date" value={qual.sinceWhenDate} />
                            </div>
                        </div>
                    )) : <p className="text-gray-500 italic">No qualifications added.</p>}
                </ReviewSection>

                <ReviewSection title="Employment History" icon={<Briefcase size={18} />} editPath="/employment">
                    {reviewData.employmentHistory.length > 0 ? reviewData.employmentHistory.map((job, index) => (
                        <div key={`job-${index}`} className="review-entry">
                            <DisplayField isSectionTitle label={`Employment #${index + 1} ${job.latest ? '(Latest)' : ''}`} />
                            <div className="grid">
                                <DisplayField label="Employer" value={job.employerName} />
                                <DisplayField label="Industry" value={job.industryDesc} />
                                <DisplayField label="Job Title" value={job.jobName} />
                                <DisplayField label="Cessation Reason" value={job.cessationDesc} />
                                <DisplayField label="Start Date" value={job.fromDate} />
                                <DisplayField label="End Date" value={job.toDate} />
                                <DisplayField label="Responsibilities" value={job.jobFunction} fullWidth />
                            </div>
                        </div>
                    )) : <p className="text-gray-500 italic">No employment history added.</p>}
                </ReviewSection>

                <ReviewSection title="Skills" icon={<Star size={18} />} editPath="/skills">
                    {skills && Object.keys(skills).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <DisplayField label="Office Skills" value={skills.officeSkill} fullWidth />
                            <DisplayField label="Other Relevant Skills" value={skills.otherSkill} fullWidth />
                            <DisplayField label="Other Information/Notes" value={skills.otherInfo} fullWidth />
                        </div>
                    ) : <p className="text-gray-500 italic">No skills information saved.</p>}
                </ReviewSection>

                <ReviewSection title="Hobbies, Languages & Resume" icon={<BookOpen size={18} />} editPath="/hobby-language">
                    <DisplayField isSectionTitle label="Hobbies" />
                    <div className="grid">
                        {hobbiesAndLanguages.hobbies.length > 0 ? hobbiesAndLanguages.hobbies.map((hobby, i) => (
                            <div key={`hobby-${i}`} className="field review-field">
                                <label>{hobby.hobbyName}:</label>
                                <p>{hobby.abilityLevel}</p>
                            </div>
                        )) : <p className="text-gray-500 italic">No hobbies added.</p>}
                    </div>
                    <DisplayField isSectionTitle label="Languages" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {hobbiesAndLanguages.languages.length > 0 ? hobbiesAndLanguages.languages.map((lang, i) => (
                            <DisplayField key={`lang-${i}`} label={lang.languageName} value={`Read: ${lang.readLevel}, Write: ${lang.writtenLevel}, Speak: ${lang.spokenLevel}`} fullWidth />
                        )) : <p className="text-gray-500 italic">No languages added.</p>}
                    </div>
                    <DisplayField isSectionTitle label="Resume" />
                    <div className="grid">
                        {hobbiesAndLanguages.resume ? (
                            <div className="field review-field full-width-field">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={16} /> Uploaded File:</label>
                                <p><strong>{hobbiesAndLanguages.resume.fileName}</strong> (Uploaded on {hobbiesAndLanguages.resume.entryDate})</p>
                            </div>
                        ) : <p className="text-gray-500 italic">No resume uploaded.</p>}
                    </div>
                </ReviewSection>

                <ReviewSection title="Field Experience" icon={<MapPin size={18} />} editPath="/field-experience">
                    {fieldExperience.length > 0 ? fieldExperience.map((exp, index) => (
                        <div key={`exp-${index}`} className="review-entry">
                            <DisplayField isSectionTitle label={`Experience #${index + 1}`} />
                            <div className="grid">
                                <DisplayField label="Field Area" value={exp.fieldAreaName} />
                                <DisplayField label="Years in Field" value={exp.yearInField} />
                                <DisplayField label="Remarks" value={exp.remark} fullWidth />
                            </div>
                        </div>
                    )) : <p className="text-gray-500 italic">No field experience added.</p>}
                </ReviewSection>
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ minWidth: '220px' }}
                >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'}
                </button>
            </div>
        </div>
    );
};

export default ReviewPage;