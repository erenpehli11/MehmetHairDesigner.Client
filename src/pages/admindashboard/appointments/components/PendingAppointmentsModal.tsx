import { useEffect, useState } from "react";
import { getAppointmentsByDate, approveAppointment, rejectAppointment } from "/../Users/Eren/Desktop/MehmetHairDesigner/MehmetHairDesigner.Client/src/services/appointmentService"
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  fullName: string;
  startTime: string;
  endTime: string;
  serviceType: number;
  status: string;
  notes?: string;
  user: {
    fullName: string;
    phoneNumber: string;
    email: string | null;
    roles: string[];
  };
}

interface Props {
  barberId: string;
  startDate: string; // 'YYYY-MM-DD'
  isOpen: boolean;
  onClose: () => void;
}

const serviceTypeMap: Record<number, string> = {
  1: "Saç",
  2: "Sakal",
  3: "Saç + Sakal"
};

export default function PendingAppointmentsModal({ barberId, startDate, isOpen, onClose }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  useEffect(() => {
  if (!barberId || !isOpen) return;

  const baseDate = new Date();
  const requests = [...Array(5)].map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return getAppointmentsByDate(barberId, iso + "T00:00:00");
  });

  Promise.all(requests)
    .then((results) => {
      const flattened = results.flat();
      console.log("🎯 Tüm veriler:", flattened);

      const filtered = flattened.filter((a) => a.status?.toLowerCase() === "pending");
      console.log("🟡 Filtrelenmiş pendingler:", filtered);

      setAppointments(filtered);
    })
    .catch(() => toast.error("Bekleyen randevular alınamadı"));
}, [barberId, isOpen]);

  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      toast.success("Randevu onaylandı");
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error("Onaylama işlemi başarısız");
    }
  };

  const handleReject = async (id: string) => {
    const reason = reasonMap[id] || "";
    if (!reason.trim()) return toast.error("Sebep giriniz");

    try {
      await rejectAppointment(id, reason);
      toast.success("Randevu reddedildi");
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error("Reddetme işlemi başarısız");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded max-w-2xl w-full shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">⏳ Bekleyen Randevular</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">✖</button>
        </div>

        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500">Bekleyen randevu bulunmamaktadır.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {appointments.map((a) => {
              const start = new Date(a.startTime);
              const timeStr = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
              const dateStr = start.toLocaleDateString("tr-TR");

              return (
                <li key={a.id} className="border rounded p-4">
                  <p><strong>{a.user.fullName}</strong> • {dateStr} {timeStr}</p>
                  
                  <p>Hizmet: {serviceTypeMap[a.serviceType]}</p>
                  
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleApprove(a.id)} className="bg-green-600 text-white px-4 py-1 rounded">Onayla</button>
                    <button onClick={() => setReasonMap(prev => ({ ...prev, [a.id]: "" }))} className="bg-red-500 text-white px-4 py-1 rounded">Reddet</button>
                  </div>

                  {/* Reddetme sebebi kutusu */}
                  {reasonMap[a.id] !== undefined && (
                    <div className="mt-2">
                      <textarea
                        placeholder="Reddetme sebebi..."
                        value={reasonMap[a.id]}
                        onChange={(e) => setReasonMap(prev => ({ ...prev, [a.id]: e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                      />
                      <button onClick={() => handleReject(a.id)} className="mt-1 bg-red-700 text-white px-3 py-1 rounded">
                        Gönder
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
