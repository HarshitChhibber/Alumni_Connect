import api from './axios';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData, role, files) => {
  const formData = new FormData();

  // 1. Append Text Fields
  Object.keys(userData).forEach((key) => {
    const value = userData[key];
    if (value === null || value === undefined) return; 

    if (key === 'milestones' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (Array.isArray(value) || typeof value === 'object') {
      // NOTE: Be careful not to double stringify if it's already a string
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // 2. Append Role
  formData.append('role', role.toLowerCase());

  // 3. Append Files (The Fix)
  // We expect 'files' to be an object like: 
  // { studentIdCardImage: FileObj } OR { degreeImage: FileObj, idCardImage: FileObj }
  if (files && typeof files === 'object') {
    Object.keys(files).forEach((key) => {
      const fileContent = files[key];
      // Only append if the file actually exists (is not null)
      if (fileContent) {
        formData.append(key, fileContent);
      }
    });
  }

  // 4. Send Request
  const response = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};