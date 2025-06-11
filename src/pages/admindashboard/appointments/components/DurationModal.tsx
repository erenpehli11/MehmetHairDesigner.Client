import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import DatePicker from "react-datepicker";


export default function DurationModal({ isOpen, onClose, onConfirm , selectedSlot}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: number , manualStartTime?: Date) => void;
  selectedSlot?: { datetime: Date }; 
  
}) {
  const [duration, setDuration] = useState(15);
  const [manualDateTime, setManualDateTime] = useState<string>("");
  const [manualStartDate, setManualStartDate] = useState<Date | null>(null);

  const handleConfirm = () => {
    const parsedDate = manualStartDate ?? undefined;
    onConfirm(duration , parsedDate);
    onClose();
  };

  

  return (

    
    <Dialog open={isOpen} onClose={onClose} className="fixed z-[1100] inset-0 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg w-80">
        <Dialog.Title className="text-lg font-semibold mb-4">Mola Süresi Seç</Dialog.Title>

        {selectedSlot === undefined && (
  <div className="mb-4">
    <label className="text-sm font-medium block mb-1">Başlangıç Zamanı</label>
    <DatePicker
      selected={manualStartDate}
      onChange={(date) => setManualStartDate(date)}
      showTimeSelect
      timeIntervals={15} // ✅ sadece 15 dk aralıklar
      dateFormat="dd.MM.yyyy HH:mm"
      className="w-full border rounded px-2 py-1"
      placeholderText="Tarih ve saat seçin"
    />
  </div>

)}

        <select
          className="w-full border rounded px-2 py-1 mb-4"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        >
          {[15, 30, 45, 60, 75, 90, 105, 120].map((d) => (
            <option key={d} value={d}>{d} dakika</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-200">İptal</button>
          <button onClick={handleConfirm} className="px-4 py-1 rounded bg-blue-600 text-white">Tamam</button>
        </div>
      </div>
    </Dialog>
  );
}
