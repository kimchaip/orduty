"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDay } from "./types";
import CalendarHeader from "./components/CalendarHeader";
import CalendarCell from "./components/CalendarCell";

export default function MonthView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    loadCalendar();
  }, [year, month]);

  async function loadCalendar() {
    const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
    const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    const { data } = await supabase
      .from("calendar")
      .select("*")
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date");

    setDays(data ?? []);
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const firstDow = days.length > 0 ? days[0].dow : 0;
  const paddedDays = [...Array(firstDow).fill(null), ...days];

  return (
    <div className="p-4">
      <CalendarHeader
        year={year}
        month={month}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />

      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((d, idx) => (
          <CalendarCell key={idx} day={d} />
        ))}
      </div>
    </div>
  );
}
