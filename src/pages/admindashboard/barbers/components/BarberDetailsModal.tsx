import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  getWorkingHoursByBarberId,
  updateWorkingHour,
} from "../../../../services/adminService";
import { updateBarber } from "../../../../services/barberService";
import { toast } from "react-hot-toast";
import type { WorkingHourDto } from "../../../../pages/admindashboard/barbers/types/WorkingHourDto";
import isEqual from "fast-deep-equal";
import { FiSettings } from "react-icons/fi";

interface Props {
  selectedBarberId: string;
  selectedBarberName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const dayNames: { [key: number]: string } = {
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
  6: "Cumartesi",
  7: "Pazar",
};

function generateTimeOptions(start = "07:00", end = "23:30"): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const current = new Date();
  current.setHours(startHour, startMinute, 0, 0);
  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  while (current <= endTime) {
    const h = String(current.getHours()).padStart(2, "0");
    const m = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${h}:${m}:00`);
    current.setMinutes(current.getMinutes() + 30);
  }
  return slots;
}

export default function BarberDetailsModal({
  selectedBarberId,
  selectedBarberName,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [workingHours, setWorkingHours] = useState<WorkingHourDto[]>([]);
  const [initialWorkingHours, setInitialWorkingHours] = useState<WorkingHourDto[]>([]);
  const [isEditable, setIsEditable] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen && selectedBarberId) {
      fetchWorkingHours();
      setName(selectedBarberName);

      setIsEditable(false);
      setShowConfirmModal(false);
    }
  }, [isOpen, selectedBarberId, selectedBarberName]);

  const fetchWorkingHours = async () => {
    try {
      const data = await getWorkingHoursByBarberId(selectedBarberId);
      setWorkingHours(data);
      setInitialWorkingHours(data);
    } catch {
      toast.error("Çalışma saatleri alınamadı.");
    }
  };

  const handleNameSave = async () => {
  if (name !== selectedBarberName) {
    const confirmSave = window.confirm("İsmi güncellemek istediğinize emin misiniz?");
    if (!confirmSave) return;

    try {
      await updateBarber(selectedBarberId, { fullName: name });
      toast.success("İsim başarıyla güncellendi");
      onUpdated(); // Listeyi güncelle
    } catch {
      toast.error("İsim güncellenemedi");
    }
  } else {
    toast("İsimde herhangi bir değişiklik yapılmadı.");
  }
};

  const handleSaveWorkingHours = async () => {
    const validHours = workingHours.map((h) => ({
      day: Number(h.day),
      start: h.start,
      end: h.end,
    })) as unknown as WorkingHourDto[];

    try {
      await updateWorkingHour({ barberId: selectedBarberId, days: validHours });
      toast.success("Çalışma saatleri kaydedildi");
      setInitialWorkingHours(workingHours);
      setShowConfirmModal(false);
      setIsEditable(false);
      onUpdated();
    } catch {
      toast.error("Saatler kaydedilemedi");
    }
  };

  const handleClose = () => {
    const isDirty = !isEqual(workingHours, initialWorkingHours);
    if (isEditable && isDirty) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleTimeChange = (day: number, type: "start" | "end", value: string) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((h) => Number(h.day) === day);
      if (index === -1) {
        updated.push({
          day: day,
          start: type === "start" ? value : "",
          end: type === "end" ? value : "",
        });
      } else {
        updated[index] = { ...updated[index], [type]: value };
      }
      return updated;
    });
  };

  const getValue = (day: number, type: "start" | "end") => {
    const found = workingHours.find((h) => Number(h.day) === day);
    return found ? found[type] : "";
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="fixed z-10 inset-0 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen">
    <div className="fixed inset-0 bg-black opacity-30" />
    <div className="bg-white p-6 rounded shadow-lg z-20 w-full max-w-2xl">
      
      {/* Başlık */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Berber Bilgileri</h2>
        <button onClick={() => setIsEditable(true)} title="Düzenle">
          <FiSettings size={20} />
        </button>
      </div>

      {/* Ad Soyad Alanı */}
      <div className="mb-1">
        <label className="block font-medium text-gray-700 mb-1">Ad Soyad</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={!isEditable}
          className={`border px-3 py-2 rounded w-full ${isEditable ? '' : 'bg-gray-100 text-gray-600'}`}
        />
      </div>

      {/* İsmi Kaydet Butonu */}
      {isEditable && (
        <div className="text-right mb-4">
          <button
            onClick={handleNameSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            İsmi Kaydet
          </button>
        </div>
      )}

      {/* Çalışma Saatleri Başlığı */}
      <h3 className="text-lg font-semibold mb-2">Çalışma Saatleri</h3>

      {/* Çalışma Saatleri */}
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} className="flex items-center gap-4">
            <div className="w-32 font-medium">{dayNames[day]}</div>
            <select
              disabled={!isEditable}
              value={getValue(day, "start")}
              onChange={(e) => handleTimeChange(day, "start", e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Başlangıç</option>
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              disabled={!isEditable}
              value={getValue(day, "end")}
              onChange={(e) => handleTimeChange(day, "end", e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Bitiş</option>
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Çalışma Saatleri Kaydet Butonu */}
      {isEditable && (
        <div className="text-right">
          <button
            onClick={handleSaveWorkingHours}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Kaydet
          </button>
        </div>
      )}

      {/* Kapat Butonu */}
      <div className="text-right mt-2">
        <button
          onClick={handleClose}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Kapat
        </button>
      </div>
    </div>
  </div>

      {showConfirmModal && (
        <Dialog
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-50" />
            <div className="bg-white p-6 rounded shadow-lg z-50 w-full max-w-md">
              <Dialog.Title className="text-lg font-bold mb-4">Onay</Dialog.Title>
              <p className="mb-4">
                Yaptığınız değişiklikleri kaydetmeden çıkmak üzeresiniz. Emin misiniz?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Hayır
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Evet
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
