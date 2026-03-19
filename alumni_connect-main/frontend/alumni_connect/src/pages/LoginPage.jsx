import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, User, Mail, Lock, BookOpen, GraduationCap,
  PlusCircle, Trash2, Globe, ArrowLeft, Upload, CheckCircle, Shield, Building2, Briefcase, Search, X
} from 'lucide-react';
import JourneyGraphModule from '../components/JourneyGraphModule';
import { useLogin, useRegister } from '../hooks/useAuth';
import image1 from '../assets/52_MjExMC53MDEyLm4wMDEuMTHQoS5wNi4xMQ.jpg';

// --- Shared Components ---

const FileUpload = ({ label, onChange, fileName, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
      <div className="space-y-1 text-center">
        {fileName ? (
            <div className="flex flex-col items-center text-green-600">
                <CheckCircle className="mx-auto h-10 w-10" />
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-gray-500">Ready for Upload</p>
            </div>
        ) : (
            <>
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                <span className="relative cursor-pointer bg-white rounded-md font-medium text-neutral-600 hover:text-neutral-500 focus-within:outline-none">
                    <span>Upload a file</span>
                </span>
                <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
            </>
        )}
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onChange} accept="image/*" />
      </div>
    </div>
  </div>
);

// --- NEW: University Picker Component ---
const UniversityPicker = ({ value, onChange, required = false }) => {
  const [uniList, setUniList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // 1. Fetch Universities on Mount
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        // Fetching universities in India. Change 'India' to other countries if needed.
        const response = await fetch('http://universities.hipolabs.com/search?country=India');
        const data = await response.json();
        const names = data.map(u => u.name).sort();
        setUniList(names);
        setFilteredList(names);
      } catch (err) {
        console.error("Failed to fetch universities", err);
        // If API fails, fallback to manual mode automatically
        setIsManual(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // 2. Handle Outside Click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 3. Filter Logic
  const handleSearch = (e) => {
    const query = e.target.value;
    onChange(query); // Update parent state immediately
    
    if (!isManual) {
      setIsOpen(true);
      const filtered = uniList.filter(uni => 
        uni.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredList(filtered);
    }
  };

  const selectUniversity = (uniName) => {
    onChange(uniName);
    setIsOpen(false);
  };

  const toggleManual = () => {
    setIsManual(!isManual);
    setIsOpen(false);
    onChange(""); // Clear input when switching modes
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Label */}
      {!isManual ? (
        <input 
          type="text" 
          value={value}
          onChange={handleSearch}
          onClick={() => setIsOpen(true)}
          placeholder="Search University..." 
          className="p-2.5 border border-gray-300 rounded-lg focus:ring-neutral-500 focus:border-neutral-500 transition duration-150 sm:text-sm w-full"
          required={required}
        />
      ) : (
        <div className="relative">
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your University / College Name" 
            className="p-2.5 border border-blue-300 bg-blue-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 sm:text-sm w-full pr-10"
            required={required}
            autoFocus
          />
          <button 
            type="button" 
            onClick={toggleManual}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            title="Back to search"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && !isManual && (
        <div className="absolute z-50 w-full bg-white mt-1 max-h-60 overflow-y-auto border border-gray-200 rounded-md shadow-lg">
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Loading list...</div>
          ) : (
            <>
              {filteredList.length > 0 ? (
                filteredList.map((uni, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => selectUniversity(uni)}
                    className="p-2.5 text-sm hover:bg-neutral-100 cursor-pointer text-gray-700 border-b border-gray-50 last:border-0"
                  >
                    {uni}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">No matches found.</div>
              )}
              
              {/* The "Other" Option */}
              <div 
                onClick={toggleManual}
                className="p-3 text-sm bg-neutral-50 hover:bg-neutral-100 cursor-pointer text-blue-600 font-medium border-t border-gray-200 flex items-center justify-center sticky bottom-0"
              >
                <PlusCircle className="w-4 h-4 mr-2"/> My University is not listed
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Helper Text */}
      {!isManual && (
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          Select from list or click "Not listed" at the bottom.
        </p>
      )}
    </div>
  );
};

const inputStyle = "p-2.5 border border-gray-300 rounded-lg focus:ring-neutral-500 focus:border-neutral-500 transition duration-150 sm:text-sm w-full";

// --- Login View ---
const LoginCard = ({ setView, onLoginSuccess, initialRole }) => {
  const [loginAs, setLoginAs] = useState(initialRole === 'admin' ? 'Admin' : (initialRole === 'alumni' ? 'Alumni' : 'Student'));
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  
  const { performLogin, loading, error } = useLogin();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await performLogin(credentials.email, credentials.password, loginAs);
    if (result.success) {
        onLoginSuccess(loginAs);
    }
  };

  const getLabel = () => {
    if (loginAs === 'Admin') return 'Admin Email';
    if (loginAs === 'Alumni') return 'Work or Personal Email';
    return 'Institute Email / ID';
  };

  const getPlaceholder = () => {
    if (loginAs === 'Admin') return 'admin@institute.com';
    if (loginAs === 'Alumni') return 'name@company.com';
    return 'rollno@institute.edu';
  };

  return (
    <div className={`p-8 space-y-6 bg-white rounded-lg shadow-xl relative overflow-hidden`}>
      <h2 className="text-2xl font-extrabold text-neutral-800 flex items-center border-b pb-4">
        {loginAs === 'Admin' ? <Shield className="w-6 h-6 mr-3 text-red-600" /> : <LogIn className="w-6 h-6 mr-3 text-neutral-600" />}
        {loginAs === 'Admin' ? 'Admin Portal' : 'Sign In'}
      </h2>

      {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {error}
          </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Login as</label>
          <select
            value={loginAs}
            onChange={(e) => {
                setLoginAs(e.target.value);
                setCredentials({ email: '', password: '' });
            }}
            className={`mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm rounded-lg shadow-sm transition-colors`}
          >
            <option value="Student">Student</option>
            <option value="Alumni">Alumni</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-gray-700">{getLabel()}</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                type="email" name="email" value={credentials.email} onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2.5 ${inputStyle}`} placeholder={getPlaceholder()} required 
            />
          </div>
        </div>

        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                type="password" name="password" value={credentials.password} onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2.5 ${inputStyle}`} placeholder="••••••••" required 
            />
          </div>
        </div>

        <button 
            type="submit" disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition duration-300
                ${loginAs === 'Admin' ? 'bg-neutral-800 hover:bg-neutral-900' : 'bg-neutral-600 hover:bg-neutral-700'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
          {loading ? 'Authenticating...' : (loginAs === 'Admin' ? 'Secure Login' : 'Login')}
        </button>
      </form>

      {loginAs !== 'Admin' && (
        <div className="text-center pt-2 space-y-3 text-sm border-t mt-4 animate-fade-in">
            <p className="text-gray-500 pt-2">Don't have an account?</p>
            <div className="flex justify-center space-x-4">
            <button onClick={() => setView('student-register')} className="text-neutral-600 hover:text-neutral-700 font-bold flex items-center">
                <User className="w-4 h-4 mr-1" /> Student Register
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setView('alumni-register')} className="text-neutral-600 hover:text-neutral-700 font-bold flex items-center">
                <BookOpen className="w-4 h-4 mr-1" /> Alumni Register
            </button>
            </div>
        </div>
      )}
      
      {loginAs === 'Admin' && (
        <div className="mt-4 text-center animate-fade-in">
            <p className="text-xs text-gray-400">Authorized Personnel Only. <br/>Contact IT Support for access.</p>
        </div>
      )}
    </div>
  );
};

// --- Student Registration View ---
const StudentRegisterCard = ({ setView, onLoginSuccess }) => {
  const [idCardFile, setIdCardFile] = useState(null);
  const [formData, setFormData] = useState({
      name: '', rollNumber: '', email: '', password: '', confirmPassword: '', university: ''
  });
  
  const { performRegister, loading, error } = useRegister();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setIdCardFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper for University Picker
  const handleUniChange = (value) => {
    setFormData(prev => ({ ...prev, university: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    if (!idCardFile) {
        alert("Please upload your ID card for verification.");
        return;
    }

    const result = await performRegister(formData, 'Student', { studentIdCardImage: idCardFile });
    
    if (result.success) {
        onLoginSuccess('Student');
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-extrabold text-neutral-800 flex items-center border-b pb-4">
        <GraduationCap className="w-6 h-6 mr-3 text-neutral-600" /> Student Registration
      </h2>

      {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="border-b border-gray-200 pb-6">
          <h3 className="lg:text-xl text-lg font-semibold text-neutral-700 flex items-center mb-4">
            <User className="w-5 h-5 mr-2" /> Personal & Academic Info
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" className={inputStyle} onChange={handleInputChange} required />
                <input type="text" name="rollNumber" placeholder="Roll Number" className={inputStyle} onChange={handleInputChange} required />
            </div>
            
            {/* UPDATED: University Picker */}
            <div className="relative">
                 <UniversityPicker 
                    value={formData.university} 
                    onChange={handleUniChange} 
                    required 
                 />
            </div>

            <input type="email" name="email" placeholder="Personal Email" className={inputStyle} onChange={handleInputChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="password" name="password" placeholder="Password" className={inputStyle} onChange={handleInputChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" className={inputStyle} onChange={handleInputChange} required />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <p className="text-xs text-blue-700 font-semibold mb-2 uppercase tracking-wide">Identity Verification</p>
                <FileUpload 
                    label="Upload Student ID Card" 
                    onChange={handleFileChange} 
                    fileName={idCardFile?.name}
                    required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                    * We will match your <b>Name, Roll No, and University</b> from this card.
                </p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-neutral-600 hover:bg-neutral-700 transition duration-300 ${loading ? 'opacity-70' : ''}`}>
          {loading ? 'Processing...' : 'Complete Registration'}
        </button>
        <button type="button" onClick={() => setView('login')} className="mt-4 w-full text-sm text-gray-600 hover:text-neutral-600 font-medium">
          &larr; Back to Sign In
        </button>
      </form>
    </div>
  );
};

// --- Alumni Registration View ---
const AlumniRegisterCard = ({ setView, setJourneyData, onLoginSuccess }) => {
  const [verifyMethod, setVerifyMethod] = useState('email'); 
  const [idCardFile, setIdCardFile] = useState(null); 
  const [degreeFile, setDegreeFile] = useState(null); 
  
  const { performRegister, loading, error } = useRegister();

  const [alumniForm, setAlumniForm] = useState({
    name: '', graduationYear: '', email: '', password: '', workEmail: '', 
    university: '', currentCompany: '', 
    milestones: [{ year: '', milestone: '', description: '', skillsGained: '', type: 'Job' }]
  });

  const handleIdFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setIdCardFile(e.target.files[0]);
  };
  
  const handleDegreeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setDegreeFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
      setAlumniForm({ ...alumniForm, [e.target.name]: e.target.value });
  };

  // Helper for University Picker
  const handleUniChange = (value) => {
    setAlumniForm(prev => ({ ...prev, university: value }));
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = alumniForm.milestones.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    setAlumniForm(prev => ({ ...prev, milestones: newMilestones }));
  };

  const addMilestone = () => {
    setAlumniForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { year: '', milestone: '', description: '', skillsGained: '', type: 'Job' }]
    }));
  };

  const handleGraphGeneration = () => {
    const userMilestones = alumniForm.milestones.filter(m => m.milestone && m.year && m.description);
    setJourneyData(userMilestones.length > 0 ? userMilestones : null); 
    setView('journey-graph'); 
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!degreeFile) {
        alert("Please upload your Degree/DMC for university verification.");
        return;
    }
    if (verifyMethod === 'card' && !idCardFile) {
        alert("Please upload your Company ID Card.");
        return;
    }
    
    const fileData = {
        degreeImage: degreeFile
    };
    if (idCardFile) {
        fileData.idCardImage = idCardFile;
    }

    const result = await performRegister(alumniForm, 'Alumni', fileData);

    if (result.success) {
        onLoginSuccess('Alumni');
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-extrabold text-neutral-800 flex items-center border-b pb-4">
        <BookOpen className="w-6 h-6 mr-3 text-neutral-600" /> Alumni Registration
      </h2>

      {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>
      )}

      <form className="space-y-6" onSubmit={handleFinalSubmit}>
        
        <div className="border-b border-gray-200 pb-6">
          <h3 className="lg:text-xl text-lg font-semibold text-neutral-700 flex items-center mb-4">
            <User className="w-5 h-5 mr-2" /> Basic Info
          </h3>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" className={inputStyle} onChange={handleInputChange} required />
                <input type="text" name="graduationYear" placeholder="Graduation Year" className={inputStyle} onChange={handleInputChange} required />
             </div>
             
             {/* New University and Company Inputs */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UPDATED: University Picker */}
                <UniversityPicker 
                    value={alumniForm.university} 
                    onChange={handleUniChange} 
                    required 
                />
                <input type="text" name="currentCompany" placeholder="Current Company" className={inputStyle} onChange={handleInputChange} required />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="Personal Email" className={inputStyle} onChange={handleInputChange} required />
                <input type="password" name="password" placeholder="Password" className={inputStyle} onChange={handleInputChange} required />
             </div>
          </div>

          {/* SECTION: University Verification (Mandatory) */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-4">
            <h4 className="flex items-center text-sm font-bold text-neutral-700 mb-3">
                <Building2 className="w-4 h-4 mr-2"/> University Verification (Mandatory)
            </h4>
            <FileUpload 
                label="Upload Degree / DMC Image" 
                onChange={handleDegreeFileChange} 
                fileName={degreeFile?.name}
                required
            />
            <p className="text-xs text-gray-500 mt-2">
                * Used to verify your specific <b>University Name</b>.
            </p>
          </div>

          {/* SECTION: Company Verification */}
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <h4 className="flex items-center text-sm font-bold text-neutral-700 mb-3">
                <Briefcase className="w-4 h-4 mr-2"/> Company Verification
            </h4>
            
            <div className="flex space-x-4 mb-4">
                <button type="button" onClick={() => setVerifyMethod('email')} className={`flex-1 py-2 px-3 text-sm rounded-md border transition ${verifyMethod === 'email' ? 'bg-neutral-700 text-white' : 'bg-white text-gray-600'}`}>
                    Corporate Email
                </button>
                <button type="button" onClick={() => setVerifyMethod('card')} className={`flex-1 py-2 px-3 text-sm rounded-md border transition ${verifyMethod === 'card' ? 'bg-neutral-700 text-white' : 'bg-white text-gray-600'}`}>
                    Company ID Card
                </button>
            </div>

            {verifyMethod === 'email' ? (
                <div className="animate-fade-in">
                      <input type="email" name="workEmail" placeholder="Work Email (e.g., name@google.com)" className={inputStyle} onChange={handleInputChange} required />
                      <p className="text-xs text-green-600 mt-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Instant Verification</p>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <FileUpload label="Upload Company ID Card" onChange={handleIdFileChange} fileName={idCardFile?.name} />
                    <p className="text-xs text-amber-600 mt-2">Requires Admin Approval.</p>
                </div>
            )}
          </div>
        </div>

        <div className="pb-4">
            <h3 className="lg:text-xl text-lg font-semibold text-neutral-700 flex items-center mb-4">
                <Globe className="w-5 h-5 mr-2" /> Career Journey
            </h3>
            
            <div className="space-y-4">
                {alumniForm.milestones.map((milestone, index) => (
                    <div key={index} className="p-3 border border-neutral-300 rounded-lg bg-neutral-50 shadow-sm relative">
                        <h4 className="font-medium text-neutral-600 mb-3">Milestone {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input type="number" placeholder="Year" value={milestone.year} onChange={(e) => handleMilestoneChange(index, 'year', e.target.value)} className={inputStyle + " col-span-1"} required />
                            <select value={milestone.type} onChange={(e) => handleMilestoneChange(index, 'type', e.target.value)} className={inputStyle + " col-span-1"}>
                                <option value="Job">Job/Role</option>
                                <option value="Higher Study">Higher Study</option>
                                <option value="Project">Big Project</option>
                            </select>
                            <input type="text" placeholder="Title" value={milestone.milestone} onChange={(e) => handleMilestoneChange(index, 'milestone', e.target.value)} className={inputStyle + " col-span-2"} required />
                            <textarea placeholder="Description..." value={milestone.description} onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)} className={inputStyle + " col-span-full h-16 resize-none"} required />
                        </div>
                        {alumniForm.milestones.length > 1 && (
                            <button type="button" onClick={() => setAlumniForm(prev => ({...prev, milestones: prev.milestones.filter((_, i) => i !== index)}))} className="absolute top-2 right-2 p-1 rounded-full bg-white text-red-500 hover:text-red-700 transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addMilestone} className="flex items-center justify-center w-full py-2 border border-dashed border-neutral-400 text-neutral-600 rounded-lg hover:bg-neutral-100 transition duration-150">
                    <PlusCircle className="w-5 h-5 mr-2" /> Add Milestone
                </button>
            </div>
        </div>

        <div className="space-y-4 pt-4">
            <button type="button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-300" onClick={handleGraphGeneration}>
                Preview Graph
            </button>
            <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-neutral-600 hover:bg-neutral-700 transition duration-300 ${loading ? 'opacity-70' : ''}`}>
                {loading ? 'Creating Account...' : 'Create Alumni Account'}
            </button>
        </div>

        <button type="button" onClick={() => setView('login')} className="mt-4 w-full text-sm text-gray-600 hover:text-neutral-600 font-medium">
          &larr; Back to Sign In
        </button>
      </form>
    </div>
  );
};

// --- Main Page Component ---
const LoginPage = ({ initialRole, initialMode, onLoginSuccess: propOnLoginSuccess, onBack }) => {
  const navigate = useNavigate();
  
  const determineInitialView = () => {
    if (initialMode === 'register') return initialRole === 'alumni' ? 'alumni-register' : 'student-register';
    return 'login';
  };

  const [currentView, setCurrentView] = useState(determineInitialView());
  const [journeyData, setJourneyData] = useState(null);

  const handleNavigation = (role) => {
    if (propOnLoginSuccess) propOnLoginSuccess(role);
    if (role === 'Alumni') navigate('/alumni');
    else if (role === 'Admin') navigate('/admin');
    else navigate('/student-dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login': return <LoginCard setView={setCurrentView} onLoginSuccess={handleNavigation} initialRole={initialRole} />;
      case 'student-register': return <StudentRegisterCard setView={setCurrentView} onLoginSuccess={handleNavigation} />;
      case 'alumni-register': return <AlumniRegisterCard setView={setCurrentView} setJourneyData={setJourneyData} onLoginSuccess={handleNavigation} />;
      case 'journey-graph': return <JourneyGraphModule milestones={journeyData} setView={setCurrentView} />;
      default: return <LoginCard setView={setCurrentView} onLoginSuccess={handleNavigation} initialRole={initialRole} />;
    }
  };

  const isFullPage = currentView === 'journey-graph';

  return (
    <div className="min-h-screen bg-neutral-50 flex poppins-font-override" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`}</style>
      
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-neutral-600 hover:text-neutral-900 z-50">
        <ArrowLeft className="w-5 h-5 mr-2" /> Home
      </button>

      <div className={`w-full max-w-7xl mx-auto ${isFullPage ? 'block' : 'grid grid-cols-1 lg:grid-cols-2'}`}>
        {!isFullPage && (
          <div className="hidden lg:flex flex-col justify-center items-center p-10 space-y-8 bg-neutral-50 lg:h-screen lg:sticky lg:top-0">
            <h1 className="text-5xl font-extrabold text-neutral-800 text-center leading-tight">
              Connect. <span className="text-neutral-600">Grow.</span> Succeed.
            </h1>
            <p className="text-neutral-600 text-lg text-center max-w-md">
              {currentView === 'login' ? 'Login or Create Account below to get started.' : 
               currentView.includes('student') ? 'Verify your identity using your Student ID Card.' : 
               'Verify using your Work Email, Company ID, and University Documents.'}
            </p>
            {image1 && <img src={image1} alt="Illustration" className="w-full max-w-lg h-auto rounded-xl shadow-2xl transition duration-500 hover:scale-[1.01]" />}
          </div>
        )}

        <div className={`flex justify-center items-start overflow-y-auto ${isFullPage ? 'col-span-full pt-12 pb-12' : 'pt-20 pb-16 lg:py-16'}`}>
          <div className={isFullPage ? 'w-full max-w-screen px-4 lg:px-0' : 'w-full max-w-xl px-4 lg:px-0'}>
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;