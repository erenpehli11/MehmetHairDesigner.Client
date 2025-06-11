import axios from 'axios';
import api from './axiosInstance';



export const getAppointmentsByDate = async (barberId: string, date: string) => {
  const res = await api.get('/api/Appointment/appointments', {
    params: { barberId, date }
  });
  return res.data;
};

export const getWorkingHoursByDay = async (barberId: string, day: number) => {
  const res = await api.get('/api/Appointment/working-hours', {
    params: { barberId, day }
  });
  return res.data;
};

export const getBusySlots = async (barberId: string, date: string) => {
  const res = await api.get('/api/Appointment/busyslots', {
    params: { barberId, date }
  });
  return res.data;
};

export const cancelAppointment = async (appointmentId: string, reason: string) => {
  return await api.put(`/api/Admin/appointment/${appointmentId}/cancel`, { reason });
};

export const getHolidays = async (barberId: string) => {
  const res = await api.get('/api/Appointment/holiday', {
    params: { barberId }
  });
  return res.data;
};

export const createAppointmentManual = async (data: {
  barberId: string;
  startTime: string;
  serviceType: number;
  notes?: string;
  fullName: string;
  phoneNumber: string;
}) => {
  const res = await api.post('/api/Admin/manual', data);
  return res.data;
};



// ✅ 3. Meşgul slot'u iptal et
export const deleteBusySlot = async (busySlotId: string) => {
  const res = await api.delete(`/api/Admin/busyslot/${busySlotId}`);
  return res.data;
};

// ✅ 4. Randevuyu onayla
export const approveAppointment = async (appointmentId: string) => {
  const res = await api.put(`/api/Admin/appointment/${appointmentId}/approve`);
  return res.data;
};

// ✅ 5. Randevuyu reddet
export const rejectAppointment = async (appointmentId: string, reason: string) => {
  const res = await api.put(`/api/Admin/appointment/${appointmentId}/reject`, { reason });
  return res.data;
};

// ✅ 6. Randevu detaylarını getir
export const getAppointmentDetails = async (Id: string) => {
  const res = await api.get(`/api/Admin/appointment/${Id}`);
  return res.data;
};

// src/services/appointmentService.ts


export const createBusySlot = async (data: {
  barberId: string;
  startTime: string;
  endTime: string;
  reason: string;
}) => {
  const response = await api.post("/api/Admin/busyslot", data);
  return response.data;
};

export const searchUsers = async (keyword: string) => {
  const res = await axios.get(`/api/Admin/search-users?keyword=${keyword}`);
  return res.data;
};