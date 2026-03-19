import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/authService'; 

// Helper to ensure context exists
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth hooks must be used within an AuthProvider");
  }
  return context;
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // FIXED: Use the safe helper
  const { login } = useAuthContext(); 

  const performLogin = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });

      if (data.user.role && data.user.role.toLowerCase() !== role.toLowerCase()) {
        throw new Error(`Unauthorized: Account exists but is not registered as ${role}`);
      }

      login(data.user, data.token);
      return { success: true, role: role };
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { performLogin, loading, error };
};

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // FIXED: Use the safe helper
  const { login } = useAuthContext();

  const performRegister = async (userData, role, file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(userData, role, file);

      if (data.token && data.user) {
        login(data.user, data.token);
      }

      return { success: true, message: data.message };
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { performRegister, loading, error };
};