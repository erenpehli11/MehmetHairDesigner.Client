import axios from "axios";
import type { CreateWorkingHourDto, WorkingHourDto } from "../pages/admindashboard/barbers/types/WorkingHourDto";

const BASE_URL = "/api/admin";


// Çalışma saatleri servisleri

export const getWorkingHoursByBarberId = async (barberId: string) => {
  const res = await axios.get(`${BASE_URL}/get-working-hours`, {
    params: { barberId },
  });
  return res.data;
};

export const createWorkingHour = async (dto: WorkingHourDto & { barberId: string }) => {
  await axios.post(`${BASE_URL}/add-working-hours`, dto);
};

export const updateWorkingHour = async (dto:CreateWorkingHourDto )=> {
  await axios.post(`${BASE_URL}/add-working-hours`, dto);
};

export const deleteWorkingHour = async (barberId: string) => {
  await axios.delete(`${BASE_URL}/working-hours/by-barber/${barberId}`);
};