import React from "react";
import "./CalendarView.css";

type SlotStatus = "available" | "pending" | "booked" | "busy" | "filtered";

type Props = {
   
  days: string[];
  visibleDays: { label: string; dateStr: string }[]; 
  timeSlots: string[];
  data: Record<string, Record<string, SlotStatus>>;
  onSlotClick?: (day: string, time: string) => void;
  highlightedSlots?: Record<string, Set<string>>;
  filteredSlots?: Record<string, Set<string>>;
  busySlots?: Record<string, Set<string>>;
  holidayDates?: Set<string>;
  workingHoursByDay?: Record<string, { start: string; end: string }>;
  isAdmin?: boolean;
};

export default function CalendarView({
  days,
  timeSlots,
  data,
  onSlotClick,
  highlightedSlots,
  filteredSlots,
  busySlots,
  holidayDates,
  visibleDays ,
  workingHoursByDay,
  isAdmin
}: Props) {
  return (
    <div className="calendar-grid">
      {/* Gün Başlıkları */}
      <div className="grid-header">
        <div className="grid-cell time-label"></div>
        {days.map((day) => (
          
          <div key={day} className="grid-cell day-header">
            {day}
          </div>
        ))}
      </div>

      {/* Zaman Slotları */}
      {timeSlots.map((time) => (
        <React.Fragment key={time}>
          <div className="grid-cell time-label">{time}</div>
          {days.map((day) => {
            

            
            
            const status = data?.[day]?.[time] || "available";
            const dateStr = visibleDays[days.indexOf(day)]?.dateStr;
            const isHoliday = dateStr && holidayDates?.has(dateStr);
            const isBusy = isHoliday || busySlots?.[day]?.has(time);
            if (isBusy) console.log("🔴 Kırmızı yapılacak slot:", day, time);
            let isOutsideWorkingHours = false;

            
const workingHours = workingHoursByDay?.[day];

if (workingHours) {
  const slotHour = parseInt(time.split(":")[0]);
  const slotMinute = parseInt(time.split(":")[1]);
  const slotTotalMinutes = slotHour * 60 + slotMinute;

  const startHour = parseInt(workingHours.start.split(":")[0]);
  const startMinute = parseInt(workingHours.start.split(":")[1]);
  const startTotalMinutes = startHour * 60 + startMinute;

  const endHour = parseInt(workingHours.end.split(":")[0]);
  const endMinute = parseInt(workingHours.end.split(":")[1]);
  const endTotalMinutes = endHour * 60 + endMinute;

  if (slotTotalMinutes < startTotalMinutes || slotTotalMinutes >= endTotalMinutes) {
    isOutsideWorkingHours = true;
  }
}




            
              const isHighlighted = highlightedSlots?.[day]?.has(time);
              const isFilteredOut = filteredSlots && !filteredSlots[day]?.has(time);

              const classNames = [
              "grid-cell",
              "slot",
              status === "busy" ? "busy" : status,
              isHighlighted ? "highlight" : null,
              isFilteredOut ? "filtered-out" : null,
               isBusy ? "busy" : null,
               isOutsideWorkingHours ? "busy" : null,
            ]
              .filter(Boolean)
              .join(" ");
             const isDisabled = !isAdmin && (
  status === "booked" || status === "pending" || isBusy || isOutsideWorkingHours
);

            return (
              
              <div
  key={`${day}-${time}`}
  className={classNames}
  title={`${day} - ${time}`}
  onClick={() => {
    console.log("Tıklandı:", day, time);
    if (isDisabled) return;
    onSlotClick?.(day, time);
    
  }}
  style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
>
  {!isFilteredOut ? time : ""}
</div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
