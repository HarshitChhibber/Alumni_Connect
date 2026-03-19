import api from './axios';

// 🟢 GET: My Profile
export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

// 🔵 GET: Specific User Profile
export const getUserProfile = async (id) => {
  const response = await api.get(`/profile/${id}`);
  return response.data;
};

// 🟣 GET: Explore Profiles
export const getExploreProfiles = async (filters = {}) => {
  // Convert object filters to query string
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.university) params.append('university', filters.university);
  if (filters.role) params.append('role', filters.role);

  const response = await api.get(`/profile/explore?${params.toString()}`);
  return response.data;
};



// 🟡 PUT: Update Profile
export const updateUserProfile = async (profileData, profilePictureFile) => {
  const formData = new FormData();

  // 1. Append Text & Complex Fields
  Object.keys(profileData).forEach((key) => {
    const value = profileData[key];
    if (value === null || value === undefined) return;

    // Stringify Arrays/Objects (Skills, Milestones, Socials)
    if (typeof value === 'object' && key !== 'profilePicture') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // 2. Append Profile Picture (if provided)
  if (profilePictureFile) {
    formData.append('avatar', profilePictureFile); // Key 'avatar' must match upload.single('avatar') in router
  }

  // 3. Send Request
  const response = await api.put('/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};