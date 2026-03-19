// services/mockApi.js

const FALLBACK_INSTITUTES = [
  { id: 1, name: "NIT Delhi", domain: "nitdelhi.ac.in", logo: "🏛️", ssoEnabled: true },
  { id: 2, name: "IIT Bombay", domain: "iitb.ac.in", logo: "🎓", ssoEnabled: false },
  { id: 3, name: "M.M. Engineering College", domain: "mmumullana.org", logo: "🏫", ssoEnabled: true },
];

const FALLBACK_TAXONOMY = {
  domains: ["Software Dev", "Data Science", "Product", "Core Engineering"],
  skills: ["React", "Python", "Java", "AutoCAD", "Financial Modeling", "AWS"],
};

export const api = {
  // --- NEW: Check if user already exists (Simulated) ---
  checkUserExists: async (identifier) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate: These IDs/Emails already exist
        const existingUsers = ['112233', 'rahul@nitdelhi.ac.in', 'NITD-001'];
        resolve(existingUsers.includes(identifier));
      }, 600);
    });
  },

  // 1. ALUMNI: Verify Work Email Domain
  verifyDomain: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const domain = email.split('@')[1];
        if (email === 'vanshika310819@gmail.com') {
           resolve({ status: 'success', data: FALLBACK_INSTITUTES[2] });
           return;
        }
        const institute = FALLBACK_INSTITUTES.find(i => i.domain === domain);
        if (institute) resolve({ status: 'success', data: institute });
        else reject({ message: 'Domain not recognized as a partner institute.' });
      }, 800);
    });
  },

  // 2. INSTITUTE: Verify ID + Secret Key
  verifyInstituteCredentials: async ({ instituteId, accessKey }) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const validCredentials = { 'NITD-001': 'sk_live_nitd_8823', 'MMU-2025': 'sk_live_mmu_9912' };
            if (validCredentials[instituteId] === accessKey) resolve({ status: 'success' });
            else reject({ message: "Invalid Institute ID or Master Key." });
        }, 800);
    });
  },

  // 3. STUDENT: Verify ID Card
  verifyStudentId: async (studentId) => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (studentId.length >= 5) resolve({ status: 'success', name: "Student" });
              else reject({ message: "Invalid Student ID/Roll Number." });
          }, 600);
      })
  },

  // Common Login
  login: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'success', token: 'mock-jwt-token-123' }), 1000);
    });
  },

  getProfileConfig: async (role) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          data: {
            taxonomy: FALLBACK_TAXONOMY,
            requiredFields: role === 'student' 
              ? ['batch', 'department', 'rollNumber'] 
              : ['gradYear', 'currentCompany', 'designation']
          }
        });
      }, 500);
    });
  },
};