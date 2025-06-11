import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getAppointmentsByDate, cancelAppointment } from "/Users/Eren/Desktop/MehmetHairDesigner/MehmetHairDesigner.Client/src/services/appointmentService"
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  serviceType: number;
  status: string;
  notes?: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
}

interface Props {
  barberId: string;
  isOpen: boolean;
  onClose: () => void;
}

const serviceTypeMap: Record<number, string> = {
  1: "Saç",
  2: "Sakal",
  3: "Saç + Sakal"
};

export default function ConfirmedAppointmentsModal({ barberId, isOpen, onClose }: Props) {
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
        const filtered = flattened.filter((a) => a.status?.toLowerCase() === "booked");
        setAppointments(filtered);
      })
      .catch(() => toast.error("Onaylanmış randevular alınamadı"));
  }, [barberId, isOpen]);

  const handleCancel = async (id: string) => {
    const reason = reasonMap[id] || "";
    if (!reason.trim()) return toast.error("İptal sebebi giriniz");

    try {
      await cancelAppointment(id, reason);
      toast.success("Randevu iptal edildi");
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("İptal işlemi başarısız");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded max-w-2xl w-full shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📅 Onaylanmış Randevular</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">✖</button>
        </div>

        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500">Onaylanmış randevu bulunmamaktadır.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {appointments.map((a) => {
              const start = new Date(a.startTime);
              const timeStr = start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
              const dateStr = start.toLocaleDateString("tr-TR");

              return (
                <li key={a.id} className="border rounded p-4">
                  <p className="font-semibold">{a.user.fullName}</p>
                  <p className="text-sm text-gray-600">{dateStr} • {timeStr}</p>
                  <p className="text-sm">Tel: {a.user.phoneNumber}</p>
                  <p className="text-sm">Hizmet: {serviceTypeMap[a.serviceType]}</p>

                  <div className="mt-2">
                    <textarea
                      placeholder="İptal sebebi..."
                      value={reasonMap[a.id] || ""}
                      onChange={(e) => setReasonMap(prev => ({ ...prev, [a.id]: e.target.value }))}
                      className="w-full border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                    <button onClick={() => handleCancel(a.id)} className="mt-2 bg-red-700 text-white px-3 py-1 rounded">
                      İptal Et
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
