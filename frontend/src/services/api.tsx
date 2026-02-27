import axios from 'axios';

// const API_URL = 'http://auth_service:3000/auth'; // your NestJS backend URL

const API_URL = '/auth';//hada relative url to go mnginx port 8080 instaed of container name

// Register
export const registerUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/register`, { email, password });
  return response.data;
};

// Login
export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // should return JWT
};

// Get Profile (protected route)
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};