import { useEffect, useState } from 'react';

type AppUserDto = {
  id: string;
  fullName: string;
  phoneNumber: string;
};

type BarberDto = {
  id: string;
  fullName: string;
};

export default function ManualAppointmentForm() {
  const [barbers, setBarbers] = useState<BarberDto[]>([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<AppUserDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUserDto | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [serviceType, setServiceType] = useState('1');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5031/api/Barber/get-barber', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBarbers(data));
  }, []);

  const searchUsers = async (keyword: string) => {
    setUserQuery(keyword);
    if (keyword.length < 2) return;

    const res = await fetch(`http://localhost:5031/api/Admin/search-users?keyword=${keyword}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUserResults(data);
  };

  const handleUserSelect = (user: AppUserDto) => {
    setSelectedUser(user);
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber);
    setUserResults([]);
  };

  const handleSubmit = async () => {
    const body = {
      fullName,
      phoneNumber,
      barberId: selectedBarber,
      startTime,
      serviceType: parseInt(serviceType),
      notes
    };

    const res = await fetch('http://localhost:5031/api/Admin/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert('Randevu başarıyla oluşturuldu');
    } else {
      const error = await res.text();
      alert('Hata: ' + error);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Manuel Randevu Oluştur</h2>

      <label>Berber:</label>
      <select
        value={selectedBarber}
        onChange={(e) => setSelectedBarber(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      >
        <option value="">Berber seçin</option>
        {barbers.map((b) => (
          <option key={b.id} value={b.id}>{b.fullName}</option>
        ))}
      </select>

      <label>Kullanıcı Ara:</label>
      <input
        type="text"
        value={userQuery}
        onChange={(e) => searchUsers(e.target.value)}
        placeholder="İsim girin"
        className="w-full border p-2 rounded"
      />
      {userResults.length > 0 && (
        <ul className="border rounded p-2 mt-1 bg-gray-50">
          {userResults.map(user => (
            <li
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="cursor-pointer hover:bg-gray-200 p-1"
            >
              {user.fullName} ({user.phoneNumber})
            </li>
          ))}
        </ul>
      )}

      <label className="block mt-4">Ad Soyad:</label>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <label className="block mt-2">Telefon:</label>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <label className="block mt-2">Tarih ve Saat:</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <label className="block mt-2">Hizmet Türü:</label>
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="1">Saç</option>
        <option value="2">Sakal</option>
        <option value="3">Saç ve Sakal</option>
      </select>

      <label className="block mt-2">Not:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-4 hover:bg-blue-700"
      >
        Randevu Oluştur
      </button>
    </div>
  );
}
