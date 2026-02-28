import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Register
export const registerUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
  return response.data;
};

// Login
export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  return response.data; // should return JWT
};

// Get Profile (protected route)
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};