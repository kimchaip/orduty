"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDay } from "./types";
import WeekCell from "./components/WeekCell";
import WeekHeader from "./components/WeekHeader";

interface WeekViewProps {
  startDate: string;
}

export default function WeekView({ startDate }: WeekViewProps) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [currentStart, setCurrentStart] = useState(startDate);

  useEffect(() => {
    loadWeek();
  }, [currentStart]);

  async function loadWeek() {
    const start = new Date(currentStart);
    const end = new Date(currentStart);
    end.setDate(end.getDate() + 6);

    const first = start.toISOString().slice(0, 10);
    const last = end.toISOString().slice(0, 10);

    const { data } = await supabase
      .from("calendar")
      .select("*")
      .gte("date", first)
      .lte("date", last)
      .order("date");

    setDays(data ?? []);
  }

  function prevWeek() {
    const d = new Date(currentStart);
    d.setDate(d.getDate() - 7);
    setCurrentStart(d.toISOString().slice(0, 10));
  }

  function nextWeek() {
    const d = new Date(currentStart);
    d.setDate(d.getDate() + 7);
    setCurrentStart(d.toISOString().slice(0, 10));
  }

  return (
    <div className="p-4">
      <WeekHeader
        startDate={currentStart}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
      />

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <WeekCell key={d.id} day={d} />
        ))}
      </div>
    </div>
  );
}
