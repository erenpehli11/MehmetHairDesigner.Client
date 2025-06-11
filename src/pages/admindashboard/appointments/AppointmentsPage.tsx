
import React, { useEffect, useState } from "react";
import AppointmentCalendar from './components/AppointmentCalendar';
import AppointmentTable from './components/AppointmentTable';
import SlotActionButtons from './components/SlotActionButtons';
import AppointmentDetailsModal from './components/AppointmentDetailsModal';
import { getAllBarbers } from '../../../services/barberService';
import { toast } from "react-hot-toast";
import { getAppointmentDetails , approveAppointment , rejectAppointment , cancelAppointment } from "../../../services/appointmentService";
import { createBusySlot } from "../../../services/appointmentService";
import axios from 'axios';
import DurationModal from './components/DurationModal';
import ManualAppointmentForm from './components/ManualAppointmentForm';
import 'react-datepicker/dist/react-datepicker.css';
import PendingAppointmentsModal from "./components/PendingAppointmentsModal";
import ConfirmedAppointmentsModal from "./components/ConfirmedAppointmentsModal";





export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'table'>('calendar');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [barbers, setBarbers] = useState<{ id: string; fullName: string }[]>([]);
  const [showDurationModal, setShowDurationModal] = useState(false);
const [pendingSlot, setPendingSlot] = useState<typeof selectedSlot>(null);
const [showManualForm, setShowManualForm] = useState(false);
const [showCustomBreakModal, setShowCustomBreakModal] = useState(false);
const [showPendingList, setShowPendingList] = useState(false);
const [showConfirmedList, setShowConfirmedList] = useState(false);
  const [appointmentStatusMap, setAppointmentStatusMap] = useState<Record<
  
  string,
  Record<string, 'available' | 'booked' | 'pending' | 'busy'>
>>({});

const toLocalDateTimeInputFormat = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16); // "2025-06-09T13:15"
};


const serviceTypeMap: Record<number, string> = {
  1: 'Saç',
  2: 'Sakal',
  3: 'Saç + Sakal'
};


const handleMarkBusy = async (durationInMinutes: number, manualStartTime?: Date) => {
  if (!selectedSlot || !selectedBarberId) return;

   const startTime = selectedSlot?.datetime ?? manualStartTime;
  if (!startTime) {
    toast.error("Başlangıç zamanı seçilmedi");
    return;
  }
  const endTime = new Date(startTime);
  endTime.setMinutes(startTime.getMinutes() + durationInMinutes);

  const day = selectedSlot.day;
  const dayStatus = appointmentStatusMap[day];

  // 🔍 Her 15 dakikalık dilimi kontrol et
  const tempTime = new Date(startTime);
  while (tempTime < endTime) {
    const timeStr = tempTime.toTimeString().slice(0, 5); // "HH:mm"
    const status = dayStatus?.[timeStr] ?? "available";

    if (status === "booked" || status === "pending") {
      toast.error(`${timeStr} dilimi dolu olduğu için mola girilemez.`);
      return;
    }

    tempTime.setMinutes(tempTime.getMinutes() + 15);
  }

  // 🕒 UTC'ye kaymadan yerel saatleri düzelt
  const toLocalISOString = (date: Date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString();
  };

  try {
    await createBusySlot({
      barberId: selectedBarberId,
      startTime: toLocalISOString(startTime),
      endTime: toLocalISOString(endTime),
      reason: "Mola",
    });

    toast.success(`${durationInMinutes} dakikalık mola başarıyla girildi`);
    setSelectedSlot(null);
  } catch {
    toast.error("Mola girilirken bir hata oluştu");
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("Token:", localStorage.getItem("token"));
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}, []);



  useEffect(() => {
  getAllBarbers()
    .then(setBarbers)
    .catch(() => toast.error("Berberler alınamadı"));
}, []);

const handleApprove = async () => {
  if (!selectedSlot?.appointmentId) return;
  try {
    await approveAppointment(selectedSlot.appointmentId);
    toast.success("Randevu onaylandı");
    setSelectedSlot(null);
  } catch {
    toast.error("Onaylama işlemi başarısız");
  }
};

const handleReject = async (reason: string) => {
  if (!selectedSlot?.appointmentId) return;
  try {
    await rejectAppointment(selectedSlot.appointmentId, reason);
    toast.success("Randevu reddedildi");
    setSelectedSlot(null);
  } catch {
    toast.error("Reddetme işlemi başarısız");
  }
};

const handleCancel = async (reason: string) => {
  if (!selectedSlot?.appointmentId) return;
  try {
    await cancelAppointment(selectedSlot.appointmentId, reason);
    toast.success("Randevu iptal edildi");
    setSelectedSlot(null);
  } catch {
    toast.error("İptal işlemi başarısız");
  }
};



  

  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    time: string;
    datetime: Date;
    status: 'available' | 'pending' | 'booked' | 'busy';
    appointmentId?: string;
  } | null>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
  const fetchDetails = async () => {
    if (!selectedSlot?.appointmentId) return;
    try {
      const details = await getAppointmentDetails(selectedSlot.appointmentId);
      setSelectedAppointment(details);
    } catch {
      toast.error("Randevu detayları alınamadı");
    }
  };
  fetchDetails();
}, [selectedSlot]);

  

  return (
    <div className="p-6 relative">

      <div className="mb-4 flex items-center gap-4">
        <select
           value={selectedBarberId}
  onChange={(e) => setSelectedBarberId(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">Berber Seç</option>
  {barbers.map((barber) => (
    <option key={barber.id} value={barber.id}>{barber.fullName}</option>
  ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Takvim
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded ${activeTab === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Tablo
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
  <button
    onClick={() => setShowManualForm(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    ➕ Randevu Oluştur
  </button>
  <button
    onClick={() => setShowCustomBreakModal(true)}
    className="bg-yellow-400 text-black px-4 py-2 rounded"
  >
    ⛔ Mola Gir
  </button>
  <button
    onClick={() => setShowPendingList(true)}
    className="bg-orange-500 text-white px-4 py-2 rounded"
  >
    ⏳ Bekleyen Randevular
  </button>
  <button
    onClick={() => setShowConfirmedList(true)}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    ✅ Onaylanmış Randevular
  </button>
</div>

      {/* Takvim ya da Tablo görünümü */}
      {activeTab === 'calendar' ? (
        <AppointmentCalendar
          selectedBarberId={selectedBarberId}
          date={date}
          onSlotSelect={(day, time, datetime , status , appointmentId) => {
  setSelectedSlot({
    day,
    time,
    datetime,
    status,
    appointmentId
   
  });
}}
onStatusMapReady={(map) => {
    setAppointmentStatusMap(map);
  }}
        />
      ) : (
        <AppointmentTable selectedBarberId={selectedBarberId} startDate={date} />
      )}

      

      

      {/* Slot aksiyonları */}
      {selectedSlot && (
  <div className="fixed inset-0 z-[1000] bg-black bg-opacity-40 flex items-center justify-center">
    
      <SlotActionButtons
        day={selectedSlot.day}
        time={selectedSlot.time}
        status={selectedSlot.status}
        fullName={selectedAppointment?.user.fullName}
        phoneNumber={selectedAppointment?.user.phoneNumber}
        serviceType={serviceTypeMap[selectedAppointment?.serviceType || 0]}
        onCreateAppointment={() => setShowManualForm(true)}
        onMarkBusy={() => {
          setPendingSlot(selectedSlot);
          setShowDurationModal(true);
        }}
        onConfirm={() => {
          handleApprove()
        }}
        onReject={(reason) => {
          handleReject(reason)
        }}
        onCancel={(reason) => {
          handleCancel(reason)
        }}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  
)}


      {/* Detay modal */}
      <AppointmentDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        appointment={selectedAppointment}
      />
      <DurationModal
  isOpen={showDurationModal}
  onClose={() => setShowDurationModal(false)}
  onConfirm={(duration) => {
    handleMarkBusy(duration);
    setShowDurationModal(false);
  }}
  selectedSlot={selectedSlot ?? undefined}
/>
{showManualForm && (
   <div className="fixed inset-0 z-[1000] bg-black bg-opacity-40 flex items-center justify-center">
      <ManualAppointmentForm
        defaultBarberId={selectedBarberId}
         defaultDateTime={selectedSlot ? toLocalDateTimeInputFormat(selectedSlot.datetime) : undefined}
        onClose={() => setShowManualForm(false)}
      />
    
  </div>
)}

{showCustomBreakModal && (
  <DurationModal
    isOpen={showCustomBreakModal}
    onClose={() => setShowCustomBreakModal(false)}
    onConfirm={(duration, manualStartTime) => {
      handleMarkBusy(duration, manualStartTime);
    }}
   selectedSlot={selectedSlot ?? undefined} // slot varsa tarih oradan alınır
  />
)}

{showPendingList && (
  <PendingAppointmentsModal
    barberId={selectedBarberId}
    startDate={date} // bu zaten YYYY-MM-DD uyumlu
    isOpen={showPendingList}
    onClose={() => setShowPendingList(false)}
  />
)}


{showConfirmedList && (
  <ConfirmedAppointmentsModal
    barberId={selectedBarberId}
    isOpen={showConfirmedList}
    onClose={() => setShowConfirmedList(false)}
  />
)}
    </div>

    
  );

}