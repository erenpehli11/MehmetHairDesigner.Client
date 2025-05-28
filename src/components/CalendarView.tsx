import React from "react";
import "./CalendarView.css";

type SlotStatus = "available" | "pending" | "booked" | "filtered";

type Props = {
  days: string[];
  timeSlots: string[];
  data: Record<string, Record<string, SlotStatus>>;
  onSlotClick?: (day: string, time: string) => void;
  highlightedSlots?: Record<string, Set<string>>;
  filteredSlots?: Record<string, Set<string>>;
};

export default function CalendarView({
  days,
  timeSlots,
  data,
  onSlotClick,
  highlightedSlots,
  filteredSlots,
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
            const isHighlighted = highlightedSlots?.[day]?.has(time);
            const isFilteredOut = filteredSlots && !filteredSlots[day]?.has(time);

            const classNames = [
              "grid-cell",
              "slot",
              status,
              isHighlighted ? "highlight" : null,
              isFilteredOut ? "filtered-out" : null,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={`${day}-${time}`}
                className={classNames}
                title={`${day} - ${time}`}
                onClick={() => !isFilteredOut && onSlotClick?.(day, time)}
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
