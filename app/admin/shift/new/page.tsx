"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Shift, sortShifts } from "@/lib/shift";
import { ShiftForm } from "@/app/admin/shift/ShiftForm";

export default function ShiftNewPage() {
  const router = useRouter();

  const [allShifts, setAllShifts] = useState<string[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [subtypeMap, setSubtypeMap] = useState<Record<string, string>>({});

  const [shift, setShift] = useState<Shift>({
    name: "",
    symbol: "",
    type: "main",
    subtype: "-",
    period: "ด",
    color: "#2596be",
    require_limit: 1,
    booking_limit: 0,
    forbid_yes: [],
    forbid_tdy: [],
    forbid_tmr: [],
  });

  // ฟังก์ชัน tone2
  function getTone2(s: Shift) {
    if (s.type === "main" && s.subtype === "leader") return "#ff00ff";
    if (s.type === "main" && s.subtype === "ortho") return "#01ef18";
    if (s.type === "main" && s.subtype === "preop") return "#00ffff";
    if ((s.type === "main" || s.type === "extend") && s.subtype === "oncall")
      return "#c38bff";
    return s.color;
  }

  // โหลด shift ทั้งหมด + sort + colorMap + subtypeMap
  useEffect(() => {
    async function loadAll() {
      const { data } = await supabase.from("shift").select("*");
      if (!data) return;

      const sorted = sortShifts(data);

      setAllShifts(sorted.map((s) => s.symbol));
      setColorMap(Object.fromEntries(sorted.map((s) => [s.symbol, s.color])));

      // subtypeMap สำหรับ tag 2-tone
      setSubtypeMap(
        Object.fromEntries(sorted.map((s) => [s.symbol, getTone2(s)]))
      );
    }

    loadAll();
  }, []);

  async function save() {
    await supabase.from("shift").insert(shift);
    router.push("/admin/shift");
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">New</h1>

      <ShiftForm
        shift={shift}
        allShifts={allShifts}
        colorMap={colorMap}
        subtypeMap={subtypeMap}
        onChange={setShift}
        onSave={save}
        onCancel={() => router.push("/admin/shift")}
      />
    </div>
  );
}
