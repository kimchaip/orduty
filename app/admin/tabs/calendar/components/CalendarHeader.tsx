"use client";

interface CalendarHeaderProps {
  year: number;
  month: number;
  prevMonth: () => void;
  nextMonth: () => void;
}

export default function CalendarHeader({
  year,
  month,
  prevMonth,
  nextMonth,
}: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded">
      <button
        onClick={prevMonth}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
      >
        ◀
      </button>

      <h2 className="text-xl font-bold text-gray-700">
        {new Date(year, month).toLocaleString("en-US", { month: "long" })} {year}
      </h2>

      <button
        onClick={nextMonth}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
      >
        ▶
      </button>
    </div>
  );
}
