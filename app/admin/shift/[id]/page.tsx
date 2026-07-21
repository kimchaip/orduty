"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Shift, sortShifts } from "@/lib/shift";
import { ShiftForm } from "@/app/admin/shift/ShiftForm";

export default function ShiftEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [allShifts, setAllShifts] = useState<string[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [subtypeMap, setSubtypeMap] = useState<Record<string, string>>({});
  const [originalSymbol, setOriginalSymbol] = useState("");
  const [colorRules, setColorRules] = useState<any[]>([]);

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

  /** apply สีจาก table color */
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

  /** handleChange เฉพาะ type/period/subtype ให้ apply สี */
  function handleChange(field: keyof Shift, value: any) {
    let updated = { ...shift, [field]: value };

    if (field === "type" || field === "period" || field === "subtype") {
      updated = applyColorRules(updated);
    }

    setShift(updated);
  }

  /** โหลด table color */
  useEffect(() => {
    async function loadColors() {
      const { data } = await supabase
        .from("color")
        .select("*")
        .order("id", { ascending: true });

      setColorRules(data || []);
    }

    loadColors();
  }, []);

  /** โหลดข้อมูล shift */
  useEffect(() => {
    async function loadAll() {
      const { data: all } = await supabase.from("shift").select("*");
      if (!all) return;

      const sortedAll = sortShifts(all);

      const { data: target } = await supabase
        .from("shift")
        .select("*")
        .eq("id", id)
        .single();

      if (!target) return;

      const sortedYes = sortedAll
        .filter((s) => target.forbid_yes?.includes(s.symbol))
        .map((s) => s.symbol);

      const sortedTdy = sortedAll
        .filter((s) => target.forbid_tdy?.includes(s.symbol))
        .map((s) => s.symbol);

      const sortedTmr = sortedAll
        .filter((s) => target.forbid_tmr?.includes(s.symbol))
        .map((s) => s.symbol);

      // โหลด shift จาก DB ก่อน apply สี
      let loadedShift: Shift = {
        id: target.id,
        name: target.name,
        symbol: target.symbol,
        period: target.period,
        type: target.type,
        subtype: target.subtype,
        color: target.color,      // จะถูก override โดย applyColorRules
        subcolor: target.subcolor, // จะถูก override โดย applyColorRules
        require_limit: target.require_limit,
        booking_limit: target.booking_limit,
        forbid_yes: sortedYes,
        forbid_tdy: sortedTdy,
        forbid_tmr: sortedTmr,
      };

      // apply สีจาก table color
      loadedShift = applyColorRules(loadedShift);

      setShift(loadedShift);
      setOriginalSymbol(target.symbol);

      setAllShifts(sortedAll.map((s) => s.symbol));
      setColorMap(Object.fromEntries(sortedAll.map((s) => [s.symbol, s.color])));
      setSubtypeMap(
        Object.fromEntries(sortedAll.map((s) => [s.symbol, s.subcolor]))
      );
    }

    loadAll();
  }, [id, colorRules]); // ← ต้องรอ colorRules ก่อน apply สี

  /** save */
  async function save() {
    const newSymbol = shift.symbol;
    const oldSymbol = originalSymbol;

    const { id: _ignore, ...shiftWithoutId } = shift;

    await supabase
      .from("shift")
      .update({
        ...shiftWithoutId,
        symbol: newSymbol,
        forbid_yes: [...shift.forbid_yes],
        forbid_tdy: [...shift.forbid_tdy],
        forbid_tmr: [...shift.forbid_tmr],
      })
      .eq("id", id);

    if (oldSymbol !== newSymbol) {
      await supabase.rpc("update_forbid_symbol", {
        oldsym: oldSymbol,
        newsym: newSymbol,
      });
    }

    router.push("/admin/shift");
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Edit</h1>

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
