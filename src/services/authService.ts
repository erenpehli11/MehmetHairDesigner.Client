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

export const loginWithGoogle = (idToken: string) => {
  return axios.post('/api/Auth/google-login', { idToken });
};


export const addPhoneNumber = (phone: string, token: string) => {
  return axios.post(
    '/api/Auth/add-phone',
    { phoneNumber: phone },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};