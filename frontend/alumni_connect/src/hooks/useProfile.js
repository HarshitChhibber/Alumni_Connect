import { useState, useCallback } from 'react';
import { useAuthContext } from './useAuth'; 
import { 
  getMyProfile, 
  getUserProfile, 
  updateUserProfile, 
  getExploreProfiles 
} from '../api/profileService';

// ==========================================
// 1. Hook for Fetching a Single Profile
// ==========================================
export const useFetchProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async (id = "me") => {
    setLoading(true);
    setError(null);
    try {
      // 1. Make API Call
      const responseData = id === "me" 
        ? await getMyProfile() 
        : await getUserProfile(id);
      
      // 2. 🛡️ SAFETY DATA EXTRACTION 🛡️
      // This handles cases where backend returns { user: ... } or { data: ... } or just { ... }
      const actualProfile = responseData.user || responseData.data || responseData;

      setProfile(actualProfile);
      return { success: true, data: actualProfile };

    } catch (err) {
      console.error("Fetch Profile Error:", err);
      const msg = err.response?.data?.message || 'Failed to fetch profile';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchProfile, profile, loading, error };
};

// ==========================================
// 2. Hook for Updating Profile
// ==========================================
export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, login } = useAuthContext(); 

  const performUpdate = async (updatedData, file) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Make API Call
      const responseData = await updateUserProfile(updatedData, file);
      
      // 2. Safety Extraction
      const actualUpdatedProfile = responseData.user || responseData.data || responseData;

      // 3. Update Global Context if critical info changed (Name/Avatar)
      if (user && actualUpdatedProfile) {
        const shouldUpdateContext = 
            actualUpdatedProfile.name !== user.name || 
            actualUpdatedProfile.profilePicture !== user.profilePicture;

        if (shouldUpdateContext) {
           // Keep existing token, update user data
           const token = localStorage.getItem('token'); 
           if (token) login(actualUpdatedProfile, token);
        }
      }

      return { success: true, data: actualUpdatedProfile };

    } catch (err) {
      console.error("Update Profile Error:", err);
      const msg = err.response?.data?.message || 'Update failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { performUpdate, loading, error };
};

// ==========================================
// 3. Hook for Explorer (List of Profiles)
// ==========================================
export const useExplore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const fetchExplore = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Make API Call
      const responseData = await getExploreProfiles(filters);
      
      // 2. 🛡️ SAFETY ARRAY EXTRACTION 🛡️
      // Handles [ ... ], { data: [ ... ] }, or { users: [ ... ] }
      let actualList = [];
      
      if (Array.isArray(responseData)) {
          actualList = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
          actualList = responseData.data;
      } else if (responseData && Array.isArray(responseData.users)) {
          actualList = responseData.users;
      }

      setProfiles(actualList);
      return { success: true, data: actualList };

    } catch (err) {
      console.error("Explore Error:", err);
      const msg = err.response?.data?.message || 'Failed to load profiles';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchExplore, profiles, loading, error };
};