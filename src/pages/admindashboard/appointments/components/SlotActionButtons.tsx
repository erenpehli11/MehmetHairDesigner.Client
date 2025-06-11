import React, { useState } from 'react';

interface Props {
  day: string;
  time: string;
  status: 'available' | 'booked' | 'pending' | 'busy';
  fullName?: string;
  serviceType?: string;
  phoneNumber?: string;
  onCreateAppointment: () => void;
  onMarkBusy: () => void;
  onViewDetails?: () => void;
  onConfirm?: () => void;
  onReject?: (reason: string) => void;
  onCancel?: (reason: string) => void;
  onClose?: () => void;
}


export default function SlotActionButtons({
  day,
  time,
  status,
  fullName,
  phoneNumber,
  serviceType,
  onCreateAppointment,
  onMarkBusy,
  onViewDetails,
  onConfirm,
  onReject,
  onCancel,
  onClose
}: Props) {
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState<'reject' | 'cancel' | null>(null);
  

  return (
  <div className="w-[400px] bg-white rounded-lg shadow-lg p-6 relative">
    {/* Başlık (Gün ve Saat) */}
    <div className="flex justify-between items-center mb-4">
      <p className="text-base font-semibold">
        📅 {day}, 🕐 {time}
      </p>
      <button onClick={onClose} className="text-gray-600 hover:text-black text-lg">✖</button>
    </div>

    {/* Detaylar */}
    {(status === 'pending' || status === 'booked') && (
      <div className="text-sm text-gray-700 space-y-1 mb-4">
        <p><strong>İsim Soyisim:</strong> {fullName ?? 'Bilinmiyor'}</p>
        <p><strong>Telefon:</strong> {phoneNumber ?? 'Bilinmiyor'}</p>
        <p><strong>Servis Tipi:</strong> {serviceType ?? 'Belirtilmemiş'}</p>
      </div>
    )}

    {status === 'busy' && (
      <div className="mb-2 text-sm text-red-600">
        <strong>Meşgul Saat</strong>
      </div>
    )}

    {status === 'available' && (
      <div className="mb-2 text-sm text-gray-500">
        Boş saat. İşlem seçin.
      </div>
    )}

    {/* İşlem Butonları */}
    {status === 'available' && (
      <>
        <button onClick={onCreateAppointment} className="w-full bg-blue-600 text-white py-2 rounded mb-2">➕ Randevu Gir</button>
        <button onClick={onMarkBusy} className="w-full bg-yellow-400 text-black py-2 rounded">⛔ Mola Gir</button>
      </>
    )}

    {status === 'pending' && (
      <>
        <button onClick={onConfirm} className="w-full bg-green-600 text-white py-2 rounded mb-2">✅ Randevuyu Onayla</button>
        <button onClick={() => setShowReason('reject')} className="w-full bg-red-500 text-white py-2 rounded">❌ Reddet</button>
      </>
    )}

    {(status === 'booked' || status === 'busy') && (
      <button onClick={() => setShowReason('cancel')} className="w-full bg-red-600 text-white py-2 rounded">🗑️ İptal Et</button>
    )}

    {/* Sebep alanı */}
    {showReason && (
      <div className="mt-3">
        <textarea
          placeholder="İptal sebebi..."
          className="w-full p-2 border rounded mb-2 text-sm"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          className="bg-red-700 text-white w-full py-1 rounded"
          onClick={() => {
            if (showReason === 'reject') onReject?.(reason);
            if (showReason === 'cancel') onCancel?.(reason);
            setReason('');
            setShowReason(null);
          }}
        >
          Gönder
        </button>
      </div>
    )}
  </div>
);

}
