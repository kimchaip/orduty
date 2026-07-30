"use client";

interface WeekHeaderProps {
  startDate: string;
  prevWeek: () => void;
  nextWeek: () => void;
}

export default function WeekHeader({ startDate, prevWeek, nextWeek }: WeekHeaderProps) {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);

  const label = `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded">
      <button
        onClick={prevWeek}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
      >
        ◀
      </button>

      <h2 className="text-xl font-bold text-gray-800">{label}</h2>

      <button
        onClick={nextWeek}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
      >
        ▶
      </button>
    </div>
  );
}
