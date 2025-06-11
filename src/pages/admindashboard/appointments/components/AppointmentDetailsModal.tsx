import React from 'react';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    fullName: string;
    startTime: string;
    endTime: string;
    serviceType: number;
    status: string;
    notes?: string;
  } | null;
}

export default function AppointmentDetailsModal({ isOpen, onClose, appointment }: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const serviceTypeMap: Record<number, string> = {
  1: 'Saç',
  2: 'Sakal',
  3: 'Saç + Sakal'
};

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded max-w-md w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Randevu Detayı</h2>

        <ul className="space-y-2 text-sm text-gray-700">
          <li><strong>ID:</strong> {appointment.id}</li>
          <li><strong>Ad Soyad:</strong> {appointment.fullName}</li>
          <li><strong>Başlangıç:</strong> {formatDateTime(appointment.startTime)}</li>
          <li><strong>Bitiş:</strong> {formatDateTime(appointment.endTime)}</li>
          <li><strong>Hizmet:</strong> {serviceTypeMap[appointment.serviceType]}</li>
          <li><strong>Durum:</strong> {appointment.status}</li>
          {appointment.notes && <li><strong>Not:</strong> {appointment.notes}</li>}
        </ul>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
