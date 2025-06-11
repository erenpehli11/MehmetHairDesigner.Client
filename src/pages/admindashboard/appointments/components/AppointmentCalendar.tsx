import React, { useEffect, useState } from 'react';
import CalendarView from '../../../../components/CalendarView';
import '../../../../components/CalendarView.css';
import toast from 'react-hot-toast';
import {
  getAppointmentsByDate,
  getWorkingHoursByDay,
  getBusySlots,
  getHolidays
} from '../../../../services/appointmentService';

interface WorkingHour {
  start: string;
  end: string;
}

interface Props {
  selectedBarberId: string;
  date: string;
  onSlotSelect?: (day: string, time: string, datetime: Date , status: 'available' | 'pending' | 'booked' | 'busy' , appointmentId?: string) => void;
  onStatusMapReady?: (map: Record<string, Record<string, 'available' | 'pending' | 'booked' | 'busy'>>) => void;
}


interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceType: number;
  userFullName: string;
}

interface Props {
  selectedBarberId: string;
  date: string;
}

export default function AppointmentCalendar({ selectedBarberId, date , onSlotSelect , onStatusMapReady }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workingHoursByDay, setWorkingHoursByDay] = useState<Record<string, WorkingHour>>({});
  const [busySlots, setBusySlots] = useState<Record<string, Set<string>>>({});
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"startTime" | "status" | "user" | null>("startTime");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  

  

  const visibleDays = [...Array(5)].map((_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'long' }),
      dateStr: d.toISOString().slice(0, 10),
    };
  });

  const generateTimeSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);
    while (startDate < endDate) {
      slots.push(startDate.toTimeString().slice(0, 5));
      startDate.setMinutes(startDate.getMinutes() + 15);
    }
    return slots;
  };

  const slotList = workingHoursByDay[visibleDays[0]?.label]?.start
    ? generateTimeSlots(
        workingHoursByDay[visibleDays[0].label].start,
        workingHoursByDay[visibleDays[0].label].end
      )
    : [];

  const appointmentStatusMap: Record<string, Record<string, 'available' | 'pending' | 'booked' | 'busy'>> = {};

  useEffect(() => {
  if (onStatusMapReady) {
    onStatusMapReady(appointmentStatusMap);
  }
}, [appointments]); // appointments değiştiğinde tekrar yolla


  visibleDays.forEach(({ label, dateStr }) => {
    appointmentStatusMap[label] = {};
    slotList.forEach((slotTime) => {
      const [hour, minute] = slotTime.split(':').map(Number);
      const slotStart = new Date(dateStr);
      slotStart.setHours(hour, minute, 0, 0);

      const match = appointments.find((a) => {
        const start = new Date(a.startTime);
        const end = new Date(a.endTime);
        return slotStart >= start && slotStart < end;
      });

      if (match) {
  if (match.status?.toLowerCase() === 'pending') {
    appointmentStatusMap[label][slotTime] = 'pending';
  } else {
    appointmentStatusMap[label][slotTime] = 'booked';
  }

} else {
  appointmentStatusMap[label][slotTime] = 'available';
}
      

    });
  });

  

  useEffect(() => {
  console.log("🧪 selectedBarberId", selectedBarberId);
  if (!selectedBarberId || !date) return;

  // 1. Randevuları çek
  Promise.all(
    [...Array(5)].map((_, i) => {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      return getAppointmentsByDate(selectedBarberId, dateStr + 'T00:00:00');
    })
  )
    .then((allData) => setAppointments(allData.flat()))
    .catch(() => toast.error('Randevular alınamadı'));

  // 2. Çalışma saatleri
  Promise.all(
    [0, 1, 2, 3, 4, 5, 6].map((day) =>
      getWorkingHoursByDay(selectedBarberId, day).then((res) => {
        const wh = res.find((item: any) => item.day === day);
        return {
          day,
          start: wh?.start ?? null,
          end: wh?.end ?? null,
        };
      })
    )
  )
    .then((results) => {
      const map: Record<string, WorkingHour> = {};
      results.forEach(({ day, start, end }) => {
        if (start && end) {
          const dayName = new Date(2024, 0, 7 + day).toLocaleDateString('en-US', {
            weekday: 'long',
          });
          map[dayName] = { start, end };
        }
      });
      setWorkingHoursByDay(map);
    })
    .catch(() => toast.error('Günlük çalışma saatleri alınamadı'));

  

  // 3. BusySlots ve Tatiller
  const startDate = new Date(date);
  const busyRequests = [...Array(5)].map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return getBusySlots(selectedBarberId, d.toISOString());
  });

  Promise.all([Promise.all(busyRequests), getHolidays(selectedBarberId)])
    .then(([busyResults, holidays]) => {
      const busyMap: Record<string, Set<string>> = {};

      // 3.1. busyMap'i sadece dateStr bazlı oluştur
      busyResults.forEach((slots: any[]) => {
        slots.forEach((slot) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);
          if (!start || !end || end.getFullYear() === 1) return;

          const dateKey = start.toISOString().slice(0, 10);
          if (!busyMap[dateKey]) busyMap[dateKey] = new Set<string>();

          const current = new Date(start);
          while (current < end) {
            const timeStr = current.toTimeString().slice(0, 5);
            busyMap[dateKey].add(timeStr);
            current.setMinutes(current.getMinutes() + 15);
          }
        });
      });

      // 3.2. visibleDays'e göre label map'i üret
      const adjustedBusyMap: Record<string, Set<string>> = {};
      visibleDays.forEach(({ label, dateStr }) => {
        adjustedBusyMap[label] = busyMap[dateStr] ?? new Set();
      });

      // 3.3. Status map'e meşgul saatleri işaretle
      visibleDays.forEach(({ label }) => {
        if (!appointmentStatusMap[label]) {
          appointmentStatusMap[label] = {};
        }

        const busySet = adjustedBusyMap[label];
        if (!busySet) return;

        busySet.forEach((time) => {
          if (appointmentStatusMap[label][time] === 'available') {
            appointmentStatusMap[label][time] = 'busy';
          }
        });
      });

      setBusySlots(adjustedBusyMap);
      setHolidayDates(new Set(holidays));

      if (onStatusMapReady) {
        onStatusMapReady(appointmentStatusMap);
      }
    })
    .catch(() => {
      setBusySlots({});
      setHolidayDates(new Set());
    });
}, [selectedBarberId, date]);





  return (
    <div className="mt-6">
      <CalendarView
      isAdmin={true}
        days={visibleDays.map((d) => d.label)}
        visibleDays={visibleDays}
        timeSlots={slotList}
        data={appointmentStatusMap}
        holidayDates={holidayDates}
        busySlots={busySlots}
        workingHoursByDay={workingHoursByDay}
        onSlotClick={(day, time) => {
  const match = visibleDays.find((d) => d.label === day);
  if (!match) return;

  const [hour, minute] = time.split(':').map(Number);
  const dt = new Date(match.dateStr);
  dt.setHours(hour, minute, 0, 0);

  const status = appointmentStatusMap?.[day]?.[time] ?? 'available';

  const matchedAppointment = appointments.find((a) => {
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    return dt >= start && dt < end;
  });

  const appointmentId = matchedAppointment?.id;

  onSlotSelect?.(day, time, dt, status, appointmentId); // ✅ 5. parametre: id
}}



      />
      
    </div>

    
  );
}
