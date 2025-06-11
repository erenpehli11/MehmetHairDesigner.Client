import axios from "axios";
import type { BarberDto } from "../pages/admindashboard/barbers/types/BarberDto"; // DTO tipini buraya koyduğunu varsayıyorum

const BASE_URL = "/api/barber";


export const getAllBarbers = async () => {
  const response = await axios.get(`${BASE_URL}/get-barber`);
  return response.data;
};

export const createBarber = async (dto: BarberDto) => {
  const response = await axios.post(`${BASE_URL}/post-barber`, dto);
  return response.data;
};

export const updateBarber = async (barberId: string, dto: BarberDto) => {
  const response = await axios.post(`${BASE_URL}/update-barber/${barberId}`, dto);
  return response.data;
};

export const deleteBarber = async (barberId: string) => {
  await axios.delete(`${BASE_URL}/delete-barber/${barberId}`);
};