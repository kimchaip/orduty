"use client";

import { CalendarDay } from "../types";

interface CalendarCellProps {
  day: CalendarDay | null;
}

export default function CalendarCell({ day }: CalendarCellProps) {
  if (!day) {
    return <div className="border h-24 bg-white rounded" />;
  }

  const isHoliday = day.is_holiday;

  return (
    <div
      className={`border h-24 p-2 rounded cursor-pointer transition-colors
        ${isHoliday ? "bg-rose-50 hover:bg-rose-100" : "bg-white hover:bg-gray-100"}
      `}
    >
      <div className="font-bold text-gray-800">
        {new Date(day.date).getDate()}
      </div>

      {day.holiday_name && (
        <div className="text-xs text-rose-700 font-bold mt-1">
          {day.holiday_name}
        </div>
      )}
    </div>
  );
}
