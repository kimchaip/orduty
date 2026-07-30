"use client";

import { useState } from "react";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

export default function CalendarPage() {
  const [mode, setMode] = useState<"month" | "week">("month");

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("month")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold">
          Month
        </button>
        <button onClick={() => setMode("week")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold">
          Week
        </button>
      </div>

      {mode === "month" ? <MonthView /> : <WeekView startDate={new Date().toISOString().slice(0,10)} />}
    </div>
  );
}
