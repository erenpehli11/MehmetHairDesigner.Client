import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // giriş yapılmadıysa login sayfasına yönlendir
      return;
    }

    // Token içindeki ad soyad claim'ini al
    const payload = JSON.parse(atob(token.split('.')[1]));
    setFullName(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/randevu')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded shadow"
        >
          Randevu Al
        </button>
        <div className="text-gray-700 font-semibold">
          👋 Merhaba, <span className="text-emerald-600">{fullName}</span>
        </div>
      </div>

      {/* İçerik buraya eklenecek */}
      <div className="text-center text-gray-500 mt-10">
        Henüz içerik eklenmedi. Randevular, istatistikler vs. buraya gelecek.
      </div>
    </div>
  );
}
