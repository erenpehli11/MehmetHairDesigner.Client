import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getAppointmentsByDate } from '../../../../services/appointmentService';
import { cancelAppointment , approveAppointment , rejectAppointment } from '../../../../services/appointmentService';


interface Appointment {
  id: string;
  fullName: string;
  startTime: string;
  endTime: string;
  serviceType: number;
  user: {
    fullName: string;
    phoneNumber: string;
  };
  status: string;
  notes?: string;
}

interface Props {
  selectedBarberId: string;
  startDate: string; // format: 'YYYY-MM-DD'
}

export default function AppointmentTable({ selectedBarberId, startDate }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sortField, setSortField] = useState<"startTime" | "status">("startTime");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
const [rejectingId, setRejectingId] = useState<string | null>(null);
const [cancelingId, setCancelingId] = useState<string | null>(null);
const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
  const statusMap: Record<string, string> = {
  booked: "Onaylanmış",
  pending: "Onay Bekliyor"
};

const openRejectInput = (id: string) => {
  setRejectingId(id);
};

  useEffect(() => {
    console.log("🧪 selectedBarberId", selectedBarberId);
    if (!selectedBarberId || !startDate) return;

    const requests = [...Array(5)].map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const iso = date.toISOString().slice(0, 10);
      return getAppointmentsByDate(selectedBarberId, iso + 'T00:00:00');
    });

    Promise.all(requests)
      .then((results) => setAppointments(results.flat()))
      .catch(() => toast.error('Randevular yüklenemedi'));
  }, [selectedBarberId, startDate]);

  
  const today = new Date();
today.setHours(0, 0, 0, 0); // sadece gün bazında kıyaslama

const upcomingAppointments = appointments.filter(a => {
  const start = new Date(a.startTime);
  return start >= today;
});

  const sortedAppointments = [...upcomingAppointments].sort((a, b) => {
  if (sortField === "startTime") {
    const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    return sortOrder === "asc" ? diff : -diff;
  }

  if (sortField === "status") {
    const priority = (s: string) => (s.toLowerCase() === "booked" ? 0 : 1);
    const diff = priority(a.status) - priority(b.status);
    if (diff !== 0) return sortOrder === "asc" ? diff : -diff;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime(); // içlerinde saat sırası
  }

  return 0;
});

const handleSort = (field: "startTime" | "status") => {
  if (sortField === field) {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortField(field);
    setSortOrder("asc");
  }
};
const handleApprove = async (id: string) => {
  try {
    await approveAppointment(id); // appointmentService.ts içindeki fonksiyon
    toast.success("Randevu onaylandı");
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "booked" } : a));
  } catch {
    toast.error("Onaylama başarısız");
  }
};

const handleCancel = async (id: string) => {
  const reason = reasonMap[id];
  if (!reason || !reason.trim()) return toast.error("Sebep giriniz");

  try {
    await cancelAppointment(id, reason);
    toast.success("Randevu iptal edildi");
    setAppointments(prev => prev.filter(a => a.id !== id));
    setCancelingId(null); // textarea'yı kapat
  } catch {
    toast.error("İptal başarısız");
  }
};

const handleReject = async (id: string) => {
  const reason = reasonMap[id];
  if (!reason || !reason.trim()) return toast.error("Sebep girin");

  try {
    await rejectAppointment(id, reason);
    toast.success("Randevu reddedildi");
    setAppointments(prev => prev.filter(a => a.id !== id));
    setRejectingId(null);
  } catch {
    toast.error("Reddetme başarısız");
  }
};


  

  const serviceTypeMap: Record<number, string> = {
    1: 'Saç',
    2: 'Sakal',
    3: 'Saç + Sakal'
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Randevu Listesi</h2>
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Tarih</th>
            <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort("startTime")}>Saat</th>
            <th className="px-4 py-2 border">Kullanıcı</th>
            <th className="px-4 py-2 border">Hizmet</th>
            <th className="px-4 py-2 border cursor-pointer" onClick={() => handleSort("status")}>Durum</th>
            <th className="px-4 py-2 border">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sortedAppointments.map((a) => {
            const start = new Date(a.startTime);
            const end = new Date(a.endTime);

            return (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2 border">{start.toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-2 border">{start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-2 border">{a.user.fullName}</td>
                <td className="px-4 py-2 border">{serviceTypeMap[a.serviceType]}</td>
                <td className="px-4 py-2 border">{statusMap[a.status.toLowerCase()] || a.status}</td>

                <td className="px-4 py-2 border space-x-2">
  {a.status.toLowerCase() === "booked" ? (
      <>
    <button onClick={() => setCancelingId(a.id)} className="text-sm text-red-600 hover:underline">İptal Et</button>

    {cancelingId === a.id && (
      <div className="mt-2">
        <textarea
          placeholder="İptal sebebi..."
          value={reasonMap[a.id] || ""}
          onChange={(e) =>
            setReasonMap((prev) => ({ ...prev, [a.id]: e.target.value }))
          }
          className="w-full border rounded px-2 py-1 text-sm"
          rows={2}
        />
        <button
          onClick={() => handleCancel(a.id)}
          className="mt-1 bg-red-600 text-white px-3 py-1 rounded"
        >
          Gönder
        </button>
      </div>
    )}
  </>

  ) : (
    <>
      <button onClick={() => handleApprove(a.id)} className="text-sm text-green-600 hover:underline">Onayla</button>
      <button onClick={() => openRejectInput(a.id)} className="text-sm text-red-600 hover:underline">Reddet</button>
      {rejectingId === a.id && (
  <div className="mt-2">
    <textarea
      placeholder="Reddetme sebebi..."
      value={reasonMap[a.id] || ""}
      onChange={(e) => setReasonMap(prev => ({ ...prev, [a.id]: e.target.value }))}
      className="w-full border rounded px-2 py-1 text-sm"
      rows={2}
    />
    <button
      onClick={() => handleReject(a.id)}
      className="mt-1 bg-red-600 text-white px-3 py-1 rounded"
    >
      Gönder
    </button>
  </div>
)}
    </>
  )}
</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
