"use client";

interface WeekHeaderProps {
  startDate: string;
  prevWeek: () => void;
  nextWeek: () => void;
  mode: "month" | "week";
  setMode: (m: "month" | "week") => void;
}

export default function WeekHeader({
  startDate,
  prevWeek,
  nextWeek,
  mode,
  setMode,
}: WeekHeaderProps) {
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

      <div className="flex items-center gap-2">
        <button
          onClick={nextWeek}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
        >
          ▶
        </button>

        <button
          onClick={() => setMode("month")}
          className={`px-3 py-1 rounded font-semibold ${
            mode === "month"
              ? "bg-blue-200 text-gray-800"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Month
        </button>

        <button
          onClick={() => setMode("week")}
          className={`px-3 py-1 rounded font-semibold ${
            mode === "week"
              ? "bg-blue-200 text-gray-800"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Week
        </button>
      </div>
    </div>
  );
}
