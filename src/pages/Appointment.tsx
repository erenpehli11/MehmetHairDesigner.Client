// [Değişmeyen importlar]
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import CalendarView from "../components/CalendarView.tsx";
import "../components/CalendarView.css";
import { FaClock, FaCalendarCheck, FaTimesCircle, FaBell } from "react-icons/fa";


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
const [showForm, setShowForm] = useState(false);
const [form, setForm] = useState({
  barberId: "",
  date: "",
  startTime: "",
  endTime: "",
  serviceType: "1"
});
const [selectedSlotTime, setSelectedSlotTime] = useState<Date | null>(null);
const [slotDay, setSlotDay] = useState<string | null>(null);
const [slotServiceType, setSlotServiceType] = useState<number>(1);
const [showCancelConfirm, setShowCancelConfirm] = useState(false);
const [busySlots, setBusySlots] = useState<Record<string, Set<string>>>({});
const [holidays, setHolidays] = useState<Set<string>>(new Set());
const [workingHoursByDay, setWorkingHoursByDay] = useState<Record<string, { start: string; end: string }>>({});
const [reloadKey, setReloadKey] = useState(0);
const [showMyAppointmentInfo, setShowMyAppointmentInfo] = useState(false);
const [userFullName, setUserFullName] = useState<string>("Kullanıcı");


const [myAppointment, setMyAppointment] = useState<null | {
  id: string;
  startTime: string;
  serviceType: number;
  status : string;
}>(null);






 const appointmentStatusMap: Record<string, Record<string, "available" | "booked" | "pending">> = {};


  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.get("/api/Barber/get-barber").then((res) => setBarbers(res.data)).catch(() => toast.error("Berberler alınamadı"));
  }, []);

  useEffect(() => {
  const name = localStorage.getItem("fullName");
  if (name) setUserFullName(name);
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
  }, [selectedBarberId, date , reloadKey]);

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
      console.log("🔍 Appointments:", allAppointments);
    })
    .catch(() => toast.error("Randevular alınamadı"));
}, [selectedBarberId, date , reloadKey]);

useEffect(() => {
  axios.get("/api/Appointment/my-appointment")
    .then(res => setMyAppointment(res.data))
    .catch(() => setMyAppointment(null));
}, []);
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

    if (match) {
  if (match.status?.toLowerCase() === "pending") {
    appointmentStatusMap[label][slotTime] = "pending";
  } else if (match.status?.toLowerCase() === "booked") {
    appointmentStatusMap[label][slotTime] = "booked";
  } else {
    appointmentStatusMap[label][slotTime] = "booked"; // fallback
  }
} else {
  appointmentStatusMap[label][slotTime] = "available";
}
  });
});

useEffect(() => {
  if (!selectedBarberId) return;

  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Pazar - Cumartesi

  Promise.all(
    daysOfWeek.map(day =>
      axios
        .get("/api/Appointment/working-hours", {
          params: { barberId: selectedBarberId, day },
        })
        .then((res) => {
          const wh = res.data.find((item: any) => item.day === day);
          return {
            day,
            start: wh?.start ?? null,
            end: wh?.end ?? null,
          };
        })
    )
  )
    .then((results) => {
      const map: Record<string, { start: string; end: string }> = {};
      results.forEach(({ day, start, end }) => {
        if (start && end) {
          const dayName = new Date(2024, 0, 7 + day).toLocaleDateString("en-US", {
            weekday: "long",
          });
          map[dayName] = { start, end };
        }
      });
      setWorkingHoursByDay(map);
    })
    .catch(() => {
      toast.error("Günlük çalışma saatleri alınamadı");
    });
}, [selectedBarberId , reloadKey]);

// 2️⃣ busySlots ve holidays verilerini al
useEffect(() => {
  if (!selectedBarberId) return;

  const today = new Date();
  const requests = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isoDate = date.toISOString();

    requests.push(
      axios
        .get("/api/Appointment/busyslots", {
          params: {
            barberId: selectedBarberId,
            date: isoDate,
          },
        })
        .then((res) => {
          const timeStrings = res.data.flatMap((slot: any) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            const slots: string[] = [];

            while (start < end) {
              slots.push(
                start.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              );
              start.setMinutes(start.getMinutes() + 15);
            }

            return slots;
          });

          return {
            dateStr: isoDate.slice(0, 10),
            times: timeStrings,
          };
        })
    );
  }

  const holidayRequest = axios
    .get("/api/Appointment/holiday", {
      params: { barberId: selectedBarberId },
    })
    .then((res) => res.data.map((item: any) => item.date.slice(0, 10)));

  Promise.all([Promise.all(requests), holidayRequest])
    .then(([busyResults, holidayDates]) => {
      const busyMap: Record<string, Set<string>> = {};
      busyResults.forEach((entry) => {
        const date = new Date(entry.dateStr);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        busyMap[dayName] = new Set(entry.times);
      });

      setBusySlots(busyMap);
      setHolidays(new Set(holidayDates));
    })
    .catch(() => {
      setBusySlots({});
      setHolidays(new Set());
      setReloadKey(prev => prev + 1);
    });
}, [selectedBarberId , reloadKey]);



  

<header className="bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-50">
  <h1 className="text-2xl font-bold text-blue-600">Takvim</h1>
  <div className="text-gray-700 font-medium">
    {userFullName}
  </div>
</header>
  return (
    <div className="p-6 max-w-6xl mx-auto">
      

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Berber Seçimi */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Berber Seç</label>
    <select
      className="w-full px-4 py-2 border rounded shadow-sm"
      value={selectedBarberId ?? ""}
      onChange={(e) => setSelectedBarberId(e.target.value)}
    >
      <option value="">Berber seçiniz</option>
      {barbers.map((barber) => (
        <option key={barber.id} value={barber.id}>{barber.fullName}</option>
      ))}
    </select>
  </div>

  {/* Tarih Seçimi */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="w-full px-4 py-2 border rounded shadow-sm"
    />
  </div>

  {/* Servis Seçimi */}
  <div>
    
  </div>
</div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
  

  {/* Randevumu Gör */}
  <div
    className="bg-indigo-100 hover:bg-indigo-200 p-4 rounded-lg shadow cursor-pointer transition"
    onClick={() => setShowMyAppointmentInfo(true)}
  >
    <div className="flex items-center gap-2 text-indigo-700 font-semibold">
      <FaCalendarCheck />
      Randevumu Gör
    </div>
    <p className="text-sm text-indigo-600 mt-1">Mevcut randevuyu görüntüle</p>
  </div>

  {/* Randevumu İptal Et */}
  {myAppointment && (
    <div
      className="bg-red-100 hover:bg-red-200 p-4 rounded-lg shadow cursor-pointer transition"
      onClick={() => setShowCancelConfirm(true)}
    >
      <div className="flex items-center gap-2 text-red-700 font-semibold">
        <FaTimesCircle />
        Randevumu İptal Et
      </div>
      <p className="text-sm text-red-600 mt-1">Randevunuzu iptal edin</p>
    </div>
  )}

  {/* Müsait Olduğunda Haber Ver */}
  <div
    className="bg-green-100 hover:bg-green-200 p-4 rounded-lg shadow cursor-pointer transition"
    onClick={() => setShowForm(true)}
  >
    <div className="flex items-center gap-2 text-green-700 font-semibold">
      <FaBell />
      Müsait Olduğunda Haber Ver
    </div>
    <p className="text-sm text-green-600 mt-1">Yer boşalınca bilgilendiril</p>
  </div>
</div>

{showForm && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">Bildirim Formu</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await axios.post("/api/Appointment/notify-when-available", {
              barberId: form.barberId,
              date: new Date(form.date).toISOString(),
              startTime: form.startTime + ":00",
              endTime: form.endTime + ":00",
              serviceType: parseInt(form.serviceType)
            });
            toast.success("Bildirim isteğiniz başarıyla kaydedildi.");
            setShowForm(false);
          } catch (err) {
            toast.error("Giriş yapmalısınız.");
          }
        }}
        className="space-y-3"
      >
        {/* Berber Seçimi */}
        <select
          name="barberId"
          onChange={(e) => setForm({ ...form, barberId: e.target.value })}
          value={form.barberId}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Berber Seçin</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.fullName}
            </option>
          ))}
        </select>

        {/* Tarih */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />

        {/* Saat Aralığı */}
        <div className="flex gap-2">
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Hizmet Tipi */}
        <select
          name="serviceType"
          value={form.serviceType}
          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          required
          className="w-full p-2 border rounded"
        >
          <option value="1">Saç</option>
          <option value="2">Sakal</option>
          <option value="3">Saç + Sakal</option>
        </select>

        <p className="text-sm text-gray-600 text-center">
          Bu saatler arasında boşluk oluştuğunda mail adresinize bilgi verilecektir.
        </p>

        <div className="flex justify-between gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            Onayla
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-400 text-white w-full py-2 rounded hover:bg-gray-500"
          >
            Kapat
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showCancelConfirm && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-6 rounded max-w-md w-full shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Randevuyu İptal Et</h2>

      <p className="mb-4 text-sm">
        🗓️ <strong>{new Date(myAppointment!.startTime).toLocaleString("tr-TR", {
          dateStyle: "long",
          timeStyle: "short"
        })}</strong> tarihli randevunuz iptal edilecektir. Onaylıyor musunuz?
      </p>

      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              await axios.delete(`/api/Appointment/${myAppointment!.id}`);
              toast.success("Randevunuz iptal edildi.");
              setMyAppointment(null);
              setShowCancelConfirm(false);
            } catch (err: any) {
              const message = typeof err?.response?.data === "string"
                ? err.response.data
                : err?.response?.data?.detail || "İptal işlemi başarısız.";
              toast.error(message);
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700"
        >
          Onayla ve İptal Et
        </button>

        <button
          onClick={() => setShowCancelConfirm(false)}
          className="bg-gray-300 text-black px-4 py-2 rounded w-full hover:bg-gray-400"
        >
          Vazgeç
        </button>
      </div>
    </div>
  </div>
)}

<div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mt-6 bg-white p-4 rounded shadow">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-green-400 border border-gray-300" />
    <span>Onaylanmış randevu</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-yellow-300 border border-gray-300" />
    <span>Onay bekleyen randevu</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-red-400 border border-gray-300" />
    <span>Berber müsait değil</span>
  </div>
</div>

  

      {workingHours && (

        
        <CalendarView
          workingHoursByDay={workingHoursByDay}
        busySlots={busySlots}
  holidayDates={holidays}
  days={visibleDays.map(d => d.label)}
  visibleDays={visibleDays} 
   // string[] olarak gönderiyoruz
  timeSlots={slotList}
  data={appointmentStatusMap}
  {...(filterActive ? { filteredSlots } : {})}
  onSlotClick={(dayLabel, time) => {
    const match = visibleDays.find(d => d.label === dayLabel);
    
    if (!match) return;

    const [hour, minute] = time.split(":").map(Number);
    const dt = new Date(match.dateStr);
    dt.setHours(hour, minute, 0, 0);
    
    setSelectedSlotTime(dt);
    setSlotDay(dayLabel);
    
  }}
/>



        
      )}

      {showMyAppointmentInfo && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-6 rounded max-w-md w-full shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Randevu Bilgisi</h2>

      {!myAppointment ? (
        <p>Şu anda bir randevunuz bulunmamaktadır.</p>
      ) : myAppointment.status?.toLowerCase() === "pending" ? (
        <p>
          📅 <strong>{new Date(myAppointment.startTime).toLocaleString("tr-TR", {
            dateStyle: "long", timeStyle: "short"
          })}</strong> tarihli randevunuz henüz <strong>onay beklemektedir</strong>.<br />
          Onaylandığında mail adresinize bilgi verilecektir.
        </p>
      ) : (
        <p>
          📅 <strong>{new Date(myAppointment.startTime).toLocaleString("tr-TR", {
            dateStyle: "long", timeStyle: "short"
          })}</strong> tarihli randevunuz <strong>onaylanmıştır</strong>.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowMyAppointmentInfo(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Kapat
        </button>
      </div>
    </div>
  </div>
)}


      {selectedSlotTime && (  console.log("form açıldı"),
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-6 rounded max-w-md w-full shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Randevu Al</h2>
      <p className="mb-2"><strong>Seçilen Saat:</strong> {selectedSlotTime.toLocaleString()}</p>

      <select
        value={slotServiceType}
        onChange={(e) => setSlotServiceType(Number(e.target.value))}
        className="w-full p-2 border rounded mb-3"
      >
        <option value={1}>Saç (30 dk)</option>
        <option value={2}>Sakal (15 dk)</option>
        <option value={3}>Saç + Sakal (45 dk)</option>
      </select>

      <button
        onClick={async () => {
          if (!selectedBarberId || !selectedSlotTime) {
            toast.error("Berber veya saat eksik.");
            return;
          }

          try {

            const local = selectedSlotTime!;
const timezoneOffsetMs = local.getTimezoneOffset() * 60 * 1000;
const correctedDate = new Date(local.getTime() - timezoneOffsetMs);

const isoStartTime = correctedDate.toISOString();
           const payload = {
  barberId: selectedBarberId,
  startTime: isoStartTime,
  serviceType: Number(slotServiceType),
  notes: "string"
};


await axios.post("/api/Appointment/registered", payload);
            toast.success("Randevu başarıyla oluşturuldu.");

            setSelectedSlotTime(null);
            setReloadKey(prev => prev + 1); 
            
          } catch (err: any) {
  const fallback = "Randevu alınamadı.";

  const rawData = err?.response?.data;

  // Eğer string ise direkt göster
  if (typeof rawData === "string") {
    toast.error(rawData);
  }
  // JSON ise önce detail, sonra errors

  // hiçbir şey yoksa
  else {
    toast.error(fallback);
  }
}

        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
      >
        Randevuyu Onayla
      </button>

      <button
        onClick={() => setSelectedSlotTime(null)}
        className="mt-2 bg-gray-300 text-black px-4 py-2 rounded w-full hover:bg-gray-400"
      >
        Vazgeç
      </button>
    </div>
  </div>
)}


      
  

  




    </div>
    
  );
  
}
