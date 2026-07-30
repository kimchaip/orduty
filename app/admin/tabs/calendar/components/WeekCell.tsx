"use client";

import { CalendarDay } from "../types";

interface WeekCellProps {
  day: CalendarDay;
}

export default function WeekCell({ day }: WeekCellProps) {
  const isHoliday = day.is_holiday;

  return (
    <div
      className={`border rounded p-2 h-32 cursor-pointer transition-colors
        ${isHoliday ? "bg-rose-50 hover:bg-rose-100" : "bg-white hover:bg-gray-100"}
      `}
    >
      <div className="font-bold text-gray-700">
        {new Date(day.date).toLocaleDateString("en-US", {
          weekday: "short",
        })}
      </div>

      <div className="text-lg font-semibold text-gray-700">
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
