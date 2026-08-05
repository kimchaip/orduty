"use client";

import { CalendarDay } from "../types";
import Link from "next/link";

interface CalendarCellProps {
  day: CalendarDay | null;
}

export default function CalendarCell({ day }: CalendarCellProps) {
  if (!day) {
    return <div className="border h-24 bg-white rounded" />;
  }

  const isHoliday = day.is_holiday;

  return (
    <Link href={`/admin/tabs/schedule?date_id=${day.id}`}>
      <div
        className="border border-gray-700 h-32 p-1 rounded cursor-pointer transition-colors bg-gray-900"
      >
        <div className="font-bold text-white">
          {new Date(day.date).getDate()}
        </div>

        {day.holiday_name && (
          <div className="text-xs font-bold bg-yellow-300 text-black rounded-lg px-2 py-1 mt-1">
            {day.holiday_name}
          </div>
        )}
      </div>
    </Link>
  );
}
