"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }:any) {
  const pathname = usePathname();

  type TabId = "schedule" | "swapduty" | "calendar" | "shift" | "staff";

  const tabs: { id: TabId; label: string; href: string }[] = [
    { id: "schedule", label: "ตาราง", href: "/admin/tabs/schedule" },
    { id: "swapduty", label: "แลก", href: "/admin/tabs/swapduty" },
    { id: "calendar", label: "ปฏิทิน", href: "/admin/tabs/calendar" },
    { id: "shift", label: "เวร", href: "/admin/tabs/shift" },
    { id: "staff", label: "คน", href: "/admin/tabs/staff" },
  ];

  const tabGroups : Record<TabId, string[]>  = {
    schedule: ["/admin/tabs/schedule", "/admin/schedule"],
    swapduty: ["/admin/tabs/swapduty", "/admin/swapduty"],
    calendar: ["/admin/tabs/calendar", "/admin/calendar"],
    shift: ["/admin/tabs/shift", "/admin/shift"],
    staff: ["/admin/tabs/staff", "/admin/staff"],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* HEADER FIXED */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-4 py-3
                      flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      {/* TAB BAR FIXED */}
      <div className="fixed top-[50px] left-0 right-0 bg-gray-800 z-40 px-3 py-2
                      flex gap-2 border-b border-gray-700 overflow-x-auto
                      whitespace-nowrap no-scrollbar touch-pan-x">
        {tabs.map((t) => {
          const active = tabGroups[t.id].some((prefix) =>
            pathname.startsWith(prefix));
          return (
            <Link
              key={t.id}
              href={t.href}
              className={`px-3 py-1 rounded text-sm ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="pt-[110px] px-4 pb-10">
        {children}
      </div>
    </div>
  );
}
