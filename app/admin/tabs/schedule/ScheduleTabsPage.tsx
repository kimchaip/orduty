"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ScheduleTabsPage() {
  type CalendarDay = {
    id: number;
    date: string;
  };

  type Shift = {
    id: number;
    name: string;
  };

  type Staff = {
    id: string;
    name: string;
  };

  type ScheduleItem = {
    id: number;
    shift_id: number;
    staff: {
      id: string;
      name: string;
    };
  };

  const searchParams = useSearchParams();
  const dateId = searchParams.get("date_id");

  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    loadCalendar();
    loadShifts();
    loadStaff();
  },[]);

  useEffect(() => {
    if (dateId) {
      const id = Number(dateId);
      setSelectedDateId(id);
      loadSchedule(id);
    }
  }, [dateId]);

  async function loadCalendar() {
    const { data } = await supabase
      .from("calendar")
      .select("id, date")
      .order("date");
    setCalendar(data ?? []);
  }

  async function loadShifts() {
    const { data } = await supabase
      .from("shift")
      .select("id, name")
      .order("id");
    setShifts(data ?? []);
  }

  async function loadStaff() {
    const { data } = await supabase
      .from("staff")
      .select("id, name")
      .order("name");
    setStaff(data ?? []);
  }

  async function loadSchedule(dateId: number) {
    const { data } = await supabase
      .from("schedule")
      .select(
        `
      id,
      shift_id,
      staff ( id, name )
    `,
      )
      .eq("date_id", dateId)
      .order("shift_id")
      .throwOnError();

    setSchedule(data);
  }

  async function addSchedule() {
    if (!selectedDateId || !selectedShiftId || !selectedStaffId) return;

    const { error } = await supabase.from("schedule").insert({
      date_id: selectedDateId,
      shift_id: selectedShiftId,
      staff_id: selectedStaffId,
    });

    if (!error) {
      loadSchedule(selectedDateId);
      setSelectedStaffId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">จัดเวรรายวัน</h1>

      {/* เลือกวัน */}
      <div>
        <label className="font-semibold">เลือกวัน</label>
        <select
          className="border border-gray-600 bg-gray-700 text-white p-2 rounded ml-2
             focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedDateId(id);
            loadSchedule(id);
          }}
        >
          <option value="" className="bg-gray-700 text-white">
            -- เลือกวัน --
          </option>
          {calendar.map((c) => (
            <option key={c.id} value={c.id} className="bg-gray-700 text-white">
              {c.date}
            </option>
          ))}
        </select>
      </div>

      {/* แสดงเวรของวันนั้น */}
      {selectedDateId && (
        <div className="border p-4 rounded bg-gray-800 text-white">
          <h2 className="font-semibold mb-2 text-blue-300">เวรของวันนี้</h2>

          {shifts.map((shift) => (
            <div key={shift.id} className="mb-4">
              <div className="font-bold text-blue-300">{shift.name}</div>

              <ul className="ml-4">
                {schedule
                  .filter((s) => s.shift_id === shift.id)
                  .map((s) => (
                    <li key={s.id} className="text-gray-200">
                      {s.staff.name ?? "—"}
                    </li>
                  ))}
              </ul>

              <select
                className="border p-2 rounded mt-2 bg-gray-700 text-white"
                onChange={(e) => {
                  setSelectedShiftId(shift.id);
                  setSelectedStaffId(e.target.value);
                }}
              >
                <option value="">-- เลือก staff --</option>
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>

              <button
                onClick={addSchedule}
                className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                เพิ่มเข้าเวร
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
