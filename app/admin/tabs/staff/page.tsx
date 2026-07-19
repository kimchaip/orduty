"use client";

import Link from "next/link";

export default function StaffTabPage() {
  return (
    <div className="space-y-6 text-gray-300">

      <h2 className="text-xl font-bold">เมนูคน</h2>

      {/* ปุ่ม setting Staff */}
      <Link
        href="/admin/staff"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white 
                   px-4 py-3 rounded-lg text-center font-semibold"
      >
        ตั้งค่าคน
      </Link>

      {/* ปุ่ม schedule by Staff */}
      <Link
        href="/admin/tabs/schedule"
        className="block w-full bg-green-600 hover:bg-green-700 text-white 
                   px-4 py-3 rounded-lg text-center font-semibold"
      >
        ตารางเวรต่อคน
      </Link>

    </div>
  );
}
