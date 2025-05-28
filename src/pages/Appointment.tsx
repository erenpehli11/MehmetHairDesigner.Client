// [Değişmeyen importlar]
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import CalendarView from "../components/CalendarView.tsx";
import "../components/CalendarView.css";

// ⏱ Slot üretici (15 dakikalık)
function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);
  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  while (startDate < endDate) {
    slots.push(startDate.toTimeString().slice(0, 5));
    startDate.setMinutes(startDate.getMinutes() + 15);
  }
  return slots;
}

export default function Appointment() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number>(1);
  const [filteredSlots, setFilteredSlots] = useState<Record<string, Set<string>> | undefined>(undefined);
  const [filterActive, setFilterActive] = useState(false);


  const appointmentStatusMap: Record<string, Record<string, "available" | "booked">> = {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.get("/api/Barber/get-barber").then((res) => setBarbers(res.data)).catch(() => toast.error("Berberler alınamadı"));
  }, []);

  useEffect(() => {
    if (!selectedBarberId || !date) return;
    const dayOfWeek = new Date(date).getDay();
    axios.get("/api/Appointment/working-hours", {
      params: { barberId: selectedBarberId, day: dayOfWeek },
    }).then((res) => {
      const todayWorkingHour = res.data.find((item: any) => item.day === dayOfWeek);
      if (todayWorkingHour?.start && todayWorkingHour?.end) {
        setWorkingHours({ start: todayWorkingHour.start, end: todayWorkingHour.end });
      } else {
        toast.error("Bu berberin bugün çalışma saati yok.");
      }
    }).catch(() => toast.error("Çalışma saatleri alınamadı"));
  }, [selectedBarberId, date]);

  useEffect(() => {
  if (!selectedBarberId || !date) return;

  const requests = [...Array(5)].map((_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    return axios.get("/api/Appointment/appointments", {
      params: { barberId: selectedBarberId, date: dateStr + "T00:00:00" }
    });
  });

  Promise.all(requests)
    .then((responses) => {
      const allAppointments = responses.flatMap(res => res.data);
      setAppointments(allAppointments);
    })
    .catch(() => toast.error("Randevular alınamadı"));
}, [selectedBarberId, date]);

  const visibleDays = [...Array(5)].map((_, i) => {
  const d = new Date(date);
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString("en-US", { weekday: "long" }),
    dateStr: d.toISOString().slice(0, 10)
  };
});

  const slotList = workingHours ? generateTimeSlots(workingHours.start, workingHours.end) : [];

  visibleDays.forEach(({ label, dateStr }, index) => {
  appointmentStatusMap[label] = {};
  slotList.forEach((slotTime) => {
    const [hour, minute] = slotTime.split(":").map(Number);
    const slotStart = new Date(dateStr);
    slotStart.setHours(hour, minute, 0, 0);

    const match = appointments.find((a) => {
      const start = new Date(a.startTime);
      const end = new Date(a.endTime);
      return slotStart >= start && slotStart < end;
    });

    appointmentStatusMap[label][slotTime] = match ? "booked" : "available";
  });
});

  const handleToggleFilter = async () => {
  if (!filterActive) {
    // İlk tıklama: filtreyi uygula
    if (!selectedBarberId) return;

    try {
      const res = await axios.get<Record<string, { time: string; isAvailable: boolean }[]>>(
        "/api/Appointment/available-slots",
        {
          params: {
            barberId: selectedBarberId,
            serviceType: selectedService,
            days: 5,
          },
        }
      );

      const duration = selectedService === 1 ? 30 : selectedService === 2 ? 15 : 45;
      const requiredSlots = duration / 15;

      const filteredMap: Record<string, Set<string>> = {};
      for (const [date, slotList] of Object.entries(res.data)) {
        const formatted = slotList.map(s => ({
  time: new Date(s.time).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
  isAvailable: s.isAvailable,
}));

formatted.sort((a, b) => a.time.localeCompare(b.time));
        const valid = new Set<string>();
        for (let i = 0; i <= formatted.length - requiredSlots; i++) {
          const block = formatted.slice(i, i + requiredSlots);
          if (block.every(s => s.isAvailable)) {
            block.forEach(s => valid.add(s.time));
          }
        }
        const day = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
        filteredMap[day] = valid;
      }

      setFilteredSlots(filteredMap);
      setFilterActive(true);
      toast.success("Filtre uygulandı");
    } catch {
      toast.error("Filtre uygulanamadı");
    }
  } else {
    // İkinci tıklama: filtreyi kaldır
    setFilteredSlots(undefined);
    setFilterActive(false);
    toast("Filtre kaldırıldı");
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <label className="font-semibold mr-2">Berber Seç:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            onChange={(e) => setSelectedBarberId(e.target.value)}
            value={selectedBarberId ?? ""}
          >
            <option value="">Berber seçiniz</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>{barber.fullName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Tarih:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={1}>Saç (30 dk)</option>
            <option value={2}>Sakal (15 dk)</option>
            <option value={3}>Saç + Sakal (45 dk)</option>
          </select>
          <button
  onClick={handleToggleFilter}
  className={`px-3 py-1 rounded text-white ${filterActive ? "bg-gray-600" : "bg-blue-600"}`}
>
  {filterActive ? "Filtreyi Kaldır" : "Müsait Saatleri Gör"}
</button>
        </div>
      </div>

      {workingHours && (
        <CalendarView
            days={visibleDays.map(d => d.label)}

          timeSlots={slotList}
          data={appointmentStatusMap}
          filteredSlots={filteredSlots}
        />
      )}
    </div>
  );
}
