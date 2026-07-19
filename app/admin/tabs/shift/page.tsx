"use client";

import Link from "next/link";

export default function ShiftTabPage() {
  return (
    <div className="space-y-6 text-gray-300">

      <h2 className="text-xl font-bold">เมนูเวร</h2>

      {/* ปุ่ม setting Shift */}
      <Link
        href="/admin/shift"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white 
                   px-4 py-3 rounded-lg text-center font-semibold"
      >
        ตั้งค่าเวร
      </Link>

      {/* ปุ่ม schedule by Staff */}
      <Link
        href="/admin/tabs/schedule"
        className="block w-full bg-green-600 hover:bg-green-700 text-white 
                   px-4 py-3 rounded-lg text-center font-semibold"
      >
        ตารางคนต่อเวร
      </Link>

    </div>
  );
}
