import axios from 'axios';

const API_URL = 'http://localhost:5031/api';

export const loginUser = async (data: { email: string; password: string }) => {
  return await axios.post(`${API_URL}/auth/login`, data);
};

export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  return await axios.post(`${API_URL}/auth/register`, data);
};