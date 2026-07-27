"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Shift, sortShifts } from "@/lib/shift";
import { ShiftForm } from "@/app/admin/shift/ShiftForm";

export default function ShiftNewPage() {
  const router = useRouter();

  const [shift, setShift] = useState<Shift>({
    name: "",
    symbol: "",
    type: "main",
    subtype: "-",
    period: "ช",
    color: "",
    subcolor: "",
    require_limit: 1,
    booking_limit: 0,
    forbid_yes: [],
    forbid_tdy: [],
    forbid_tmr: [],
  });

  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [colorRules, setColorRules] = useState<any[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [subtypeMap, setSubtypeMap] = useState<Record<string, string>>({});

  /* ----------------------------------------------------------
   * applyColorRules
   * ---------------------------------------------------------- */
  function applyColorRules(s: Shift) {
    let color1 = s.color;
    let color2 = s.subcolor;

    const rule1 = colorRules.find(
      (c) =>
        c.type === s.type &&
        ((s.type === "main" && c.period === s.period) || s.type !== "main"),
    );
    if (rule1) color1 = rule1.color;

    const rule2 = colorRules.find((c) => c.subtype === s.subtype);
    if (rule2) color2 = rule2.color;
    else color2 = color1;

    return { ...s, color: color1, subcolor: color2 };
  }

  /* ----------------------------------------------------------
   * handleChange
   * ---------------------------------------------------------- */
  function handleChange(field: keyof Shift, value: any) {
    let updated = { ...shift, [field]: value };

    if (field === "type" || field === "period" || field === "subtype") {
      updated = applyColorRules(updated);
    }

    setShift(updated);
  }

  /* ----------------------------------------------------------
   * โหลดสี
   * ---------------------------------------------------------- */
  useEffect(() => {
    async function loadColors() {
      const { data } = await supabase
        .from("color")
        .select("*")
        .order("id", { ascending: true });

      setColorRules(data || []);
      setShift((old) => applyColorRules(old));
    }

    loadColors();
  }, []);

  /* ----------------------------------------------------------
   * โหลด shift ทั้งหมด
   * ---------------------------------------------------------- */
  useEffect(() => {
    async function loadAll() {
      const { data } = await supabase.from("shift").select("*");
      if (!data) return;

      const sorted = sortShifts(data);
      setAllShifts(sorted);

      setColorMap(Object.fromEntries(sorted.map((s) => [s.symbol, s.color])));
      setSubtypeMap(
        Object.fromEntries(sorted.map((s) => [s.symbol, s.subcolor])),
      );
    }

    loadAll();
  }, []);

  /* ----------------------------------------------------------
   * save
   * ---------------------------------------------------------- */
  async function save() {
    await supabase.from("shift").insert(shift);

    // เรียก forbid ใหม่ทั้งหมด
    await supabase.rpc("update_all_forbid");

    router.push("/admin/shift");
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">New Shift</h1>

      <ShiftForm
        shift={shift}
        allShifts={allShifts.map((s) => s.symbol)}
        colorMap={colorMap}
        subtypeMap={subtypeMap}
        onChange={handleChange}
        onSave={save}
        onCancel={() => router.push("/admin/shift")}
      />
    </div>
  );
}
