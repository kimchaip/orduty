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
  const [colorRules, setColorRules] = useState<any[]>([]);

  const [shift, setShift] = useState<Shift>({
    name: "",
    symbol: "",
    type: "main",
    subtype: "-",
    period: "ช",
    color: "",        // ← ให้ applyColorRules ใส่ให้
    subcolor: "",     // ← ให้ applyColorRules ใส่ให้
    require_limit: 1,
    booking_limit: 0,
    forbid_yes: [],
    forbid_tdy: [],
    forbid_tmr: [],
  });

  function applyColorRules(s: Shift) {
    let color1 = s.color;
    let color2 = s.subcolor;

    // color1: type + period (main ต้อง match period)
    const rule1 = colorRules.find(
      (c) =>
        c.type === s.type &&
        ((s.type === "main" && c.period === s.period) ||
          s.type !== "main")
    );
    if (rule1) color1 = rule1.color;

    // color2: subtype
    const rule2 = colorRules.find((c) => c.subtype === s.subtype);
    if (rule2) color2 = rule2.color;
    else color2 = color1;

    return { ...s, color: color1, subcolor: color2 };
  }

  function handleChange(field: keyof Shift, value: any) {
    let updated = { ...shift, [field]: value };

    if (field === "type" || field === "period" || field === "subtype") {
      updated = applyColorRules(updated);
    }

    setShift(updated);
  }

  // โหลด table color
  useEffect(() => {
    async function loadColors() {
      const { data } = await supabase
        .from("color")
        .select("*")
        .order("id", { ascending: true });

      setColorRules(data || []);

      // apply สีเริ่มต้นทันที
      setShift((old) => applyColorRules(old));
    }

    loadColors();
  }, []);

  // โหลด shift ทั้งหมด + sort + colorMap + subtypeMap
  useEffect(() => {
    async function loadAll() {
      const { data } = await supabase.from("shift").select("*");
      if (!data) return;

      const sorted = sortShifts(data);

      setAllShifts(sorted.map((s) => s.symbol));
      setColorMap(Object.fromEntries(sorted.map((s) => [s.symbol, s.color])));
      setSubtypeMap(
        Object.fromEntries(sorted.map((s) => [s.symbol, s.subcolor]))
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
        onChange={handleChange}
        onSave={save}
        onCancel={() => router.push("/admin/shift")}
      />
    </div>
  );
}
