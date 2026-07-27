"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Shift, sortShifts } from "@/lib/shift";

export default function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSubtype, setFilterSubtype] = useState("");
  const [showNewBtn, setShowNewBtn] = useState(false);

  const router = useRouter();

  // Detect scroll direction
  useEffect(() => {
    let lastY = document.documentElement.scrollTop;

    function onScroll() {
      const currentY = document.documentElement.scrollTop;
      setShowNewBtn(currentY < lastY);
      lastY = currentY;
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔥 deleteShift อยู่ใน scope ของ ShiftList
  async function deleteShift(id: number) {
    if (!confirm("ลบเวรนี้จริงไหม?")) return;

    await supabase.from("shift").delete().eq("id", id);

    await supabase.rpc("update_all_forbid");

    const { data } = await supabase.from("shift").select("*");
    const sorted = sortShifts(data || []);
    setShifts(sorted);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("shift").select("*");
      const sorted = sortShifts(data || []);
      setShifts(sorted);
    }

    load();
  }, []);

  const colorMap = Object.fromEntries(shifts.map((s) => [s.symbol, s.color]));
  const subtypeMap = Object.fromEntries(
    shifts.map((s) => [s.symbol, getTone2(s)])
  );

  const filtered = shifts.filter((s) => {
    const matchText =
      filterText === "" ||
      s.name.toLowerCase().includes(filterText.toLowerCase()) ||
      s.symbol.toLowerCase().includes(filterText.toLowerCase());

    const matchType = filterType === "" || s.type === filterType;
    const matchSubtype = filterSubtype === "" || s.subtype === filterSubtype;

    return matchText && matchType && matchSubtype;
  });

  return (
    <div className="p-4 text-white relative">
      <h1 className="text-xl font-bold mb-4">Shift List</h1>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          placeholder="ค้นหา (name / symbol)"
          className="bg-gray-800 p-2 rounded w-full"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        <select
          className="bg-gray-800 p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Type ทั้งหมด</option>
          <option value="main">main</option>
          <option value="extend">extend</option>
          <option value="free">free</option>
          <option value="summit">summit</option>
        </select>

        <select
          className="bg-gray-800 p-2 rounded"
          value={filterSubtype}
          onChange={(e) => setFilterSubtype(e.target.value)}
        >
          <option value="">Subtype ทั้งหมด</option>
          <option value="-">-</option>
          <option value="leader">leader</option>
          <option value="preop">preop</option>
          <option value="ortho">ortho</option>
          <option value="oncall">oncall</option>
        </select>
      </div>

      {/* Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <ShiftCard
            key={s.id}
            shift={s}
            colorMap={colorMap}
            subtypeMap={subtypeMap}
            deleteShift={deleteShift}   // ✔ ส่งเข้าไป
          />
        ))}
      </div>

      {showNewBtn && (
        <button
          onClick={() => router.push("/admin/shift/new")}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          + New
        </button>
      )}
    </div>
  );
}

function getTone2(s: Shift) {
  if (s.type === "main" && s.subtype === "leader") return "#ff00ff";
  if (s.type === "main" && s.subtype === "ortho") return "#01ef18";
  if (s.type === "main" && s.subtype === "preop") return "#00ffff";
  if ((s.type === "main" || s.type === "extend") && s.subtype === "oncall")
    return "#c38bff";

  return s.color;
}

function ShiftCard({
  shift,
  colorMap,
  subtypeMap,
  deleteShift,
}: {
  shift: Shift;
  colorMap: Record<string, string>;
  subtypeMap: Record<string, string>;
  deleteShift: (id: number) => void;   // ✔ รับฟังก์ชัน
}) {
  const router = useRouter();

  function goEdit() {
    router.push(`/admin/shift/${shift.id}`);
  }

  return (
    <div
      className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition cursor-pointer"
      onClick={goEdit}
    >
      {/* ปุ่ม Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteShift(shift.id!);   // ✔ ใช้งานได้
        }}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded"
      >
        Delete
      </button>

      {/* Vertical 2-tone bar */}
      <div
        className="absolute left-0 top-0 h-full w-2 rounded-l-lg"
        style={{
          background: `linear-gradient(
            to bottom,
            ${shift.color} 0%,
            ${shift.color} 66%,
            ${shift.subcolor} 66%,
            ${shift.subcolor} 100%
          )`,
        }}
      />

      {/* Name + Symbol (ลบวงกลมสีออกแล้ว) */}
      <div className="flex justify-between items-center mb-2 pl-3">
        <div className="text-lg font-bold">
          {shift.name} | {shift.symbol}
        </div>
      </div>

      {/* Type + Subtype */}
      <div className="text-sm text-gray-400 mb-2 pl-3">
        Type: <span className="text-white">{shift.type}</span>
        &nbsp;|&nbsp; Subtype:{" "}
        <span className="text-white">{shift.subtype}</span>
      </div>

      {/* Limits */}
      <div className="text-sm text-gray-400 mb-2 pl-3">
        Require: <span className="text-white">{shift.require_limit}</span>
        &nbsp;|&nbsp; Booking:{" "}
        <span className="text-white">{shift.booking_limit}</span>
      </div>

      {/* forbid_yes */}
      <TagGroup label="ห้าม-เมื่อวาน">
        {shift.forbid_yes?.map((sym) => (
          <SymbolTag
            key={sym}
            symbol={sym}
            color={colorMap[sym]}
            subtypeColor={subtypeMap[sym]}
          />
        ))}
      </TagGroup>

      {/* forbid_tdy */}
      <TagGroup label="ห้าม-วันนี้">
        {shift.forbid_tdy?.map((sym) => (
          <SymbolTag
            key={sym}
            symbol={sym}
            color={colorMap[sym]}
            subtypeColor={subtypeMap[sym]}
          />
        ))}
      </TagGroup>

      {/* forbid_tmr */}
      <TagGroup label="ห้าม-พรุ่งนี้">
        {shift.forbid_tmr?.map((sym) => (
          <SymbolTag
            key={sym}
            symbol={sym}
            color={colorMap[sym]}
            subtypeColor={subtypeMap[sym]}
          />
        ))}
      </TagGroup>
    </div>
  );
}

function TagGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pl-3 mb-2 bg-gray-900 p-2 rounded border border-gray-700">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex flex-wrap gap-2 min-h-[20px]">{children}</div>
    </div>
  );
}

function SymbolTag({
  symbol,
  color,
  subtypeColor,
}: {
  symbol: string;
  color: string;
  subtypeColor: string;
}) {
  return (
    <span
      className="px-2 py-1 text-xs rounded font-bold text-black border border-gray-600 relative"
      style={{
        backgroundColor: color,
      }}
    >
      {symbol}

      <div
        className="absolute left-0 bottom-0 w-full h-1 rounded-b"
        style={{ backgroundColor: subtypeColor }}
      />
    </span>
  );
}
