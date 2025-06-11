import React, { useEffect, useState } from "react";
import {
  getAllBarbers,
  createBarber,
  deleteBarber,
  updateBarber,
} from "../../../../services/barberService";
import { toast } from "react-hot-toast";
import BarberDetailsModal from "./BarberDetailsModal";

interface selectedBarberId {
  id: string;
  fullName: string;
}

export default function BarberList() {
  const [barbers, setBarbers] = useState<selectedBarberId[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<selectedBarberId | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBarbers = async () => {
    try {
      const data = await getAllBarbers();
      setBarbers(data);
    } catch (err) {
      toast.error("Berberler alınamadı.");
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleAdd = async () => {
    const fullName = prompt("Yeni berber adı:");
    if (!fullName) return;

    try {
      await createBarber({ fullName });
      toast.success("Berber eklendi");
      fetchBarbers();
    } catch {
      toast.error("Berber eklenemedi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Berberi silmek istediğinize emin misiniz?")) return;

    try {
      await deleteBarber(id);
      toast.success("Berber silindi");
      fetchBarbers();
    } catch {
      toast.error("Silme başarısız");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Berber Listesi</h2>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          + Ekle
        </button>
      </div>

      {barbers.length === 0 ? (
        <p>Hiç berber yok.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Adı</th>
              <th className="border px-4 py-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((barber) => (
              <tr key={barber.id}>
                <td className="border px-4 py-2">{barber.fullName}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBarber(barber);
                      setModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => handleDelete(barber.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedBarber && (
        <BarberDetailsModal
           selectedBarberId={selectedBarber.id} 
           selectedBarberName={selectedBarber.fullName}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={fetchBarbers}
        />
      )}
    </div>
  );
}
