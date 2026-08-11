"use client";

import { useState } from "react";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

export default function CalendarPage() {
  const [mode, setMode] = useState<"month" | "week">("month");

  return (
    <div className="p-4">
      {mode === "month" ? (
        <MonthView mode={mode} setMode={setMode} />
      ) : (
        <WeekView
          startDate={new Date().toISOString().slice(0, 10)}
          mode={mode}
          setMode={setMode}
        />
      )}
    </div>
  );
}
