"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Tabs
// import ScheduleTab from "./tabs/ScheduleTab";
// import SwapDutyTab from "./tabs/SwapDutyTab";
// import CalendarTab from "./tabs/CalendarTab";
// import ShiftTab from "./tabs/ShiftTab";
import StaffTab from "./tabs/StaffTab";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("staff");

  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "swapduty", label: "SwapDuty" },
    { id: "calendar", label: "Calendar" },
    { id: "shift", label: "Shift" },
    { id: "staff", label: "Staff" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* HEADER FIXED */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="text-red-400 font-semibold"
        >
          Logout
        </button>
      </div>

      {/* TAB BAR FIXED */}
      <div className="fixed top-[55px] left-0 right-0 bg-gray-800 z-40 px-3 py-2 flex gap-2 border-b border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1 rounded text-sm ${
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="pt-[110px] px-4 pb-10">
        {activeTab === "schedule" && (
          <div className="text-gray-400">ScheduleTab ยังไม่ใส่</div>
        )}

        {activeTab === "swapduty" && (
          <div className="text-gray-400">SwapDutyTab ยังไม่ใส่</div>
        )}

        {activeTab === "calendar" && (
          <div className="text-gray-400">CalendarTab ยังไม่ใส่</div>
        )}

        {activeTab === "shift" && (
          <div className="text-gray-400">ShiftTab ยังไม่ใส่</div>
        )}

        {activeTab === "staff" && <StaffTab />}
      </div>
    </div>
  );
}
