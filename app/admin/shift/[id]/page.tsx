"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Shift, sortShifts } from "@/lib/shift";
import { ShiftForm } from "@/app/admin/shift/ShiftForm";

export default function ShiftEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; // ← ใช้แบบเดิมตามที่คุณต้องการ

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
    color: "#90EE90",
    subcolor: "",
    require_limit: 1,
    booking_limit: 0,
    forbid_yes: [],
    forbid_tdy: [],
    forbid_tmr: [],
  });

  function getTone2(s: Shift) {
    if (s.type === "main" && s.subtype === "leader") return "#ff00ff";
    if (s.type === "main" && s.subtype === "ortho") return "#01ef18";
    if (s.type === "main" && s.subtype === "preop") return "#00ffff";
    if ((s.type === "main" || s.type === "extend") && s.subtype === "oncall")
      return "#c38bff";
    return s.color;
  }

  function applyColorRules(s: Shift) {
    let color1 = s.color;
    let color2 = s.subcolor;

    // หา color1 จาก type + period
    const rule1 = colorRules.find(
      (c) =>
        c.type === s.type &&
        ((s.type === "main" && c.period === s.period) || s.type !== "main"),
    );
    if (rule1) color1 = rule1.color;

    // หา color2 จาก subtype
    const rule2 = colorRules.find((c) => c.subtype === s.subtype);
    if (rule2) color2 = rule2.color;

    return { ...s, color: color1, subcolor: color2 };
  }

  function handleChange(field: keyof Shift, value: any) {
    let updated = { ...shift, [field]: value };

    if (field === "type" || field === "period" || field === "subtype") {
      updated = applyColorRules(updated);
    }

    setShift(updated);
  }

  // โหลดข้อมูลตามเดิม (ไม่แก้ load ซ้ำ)
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

      setShift({
        id: target.id,
        name: target.name,
        symbol: target.symbol,
        period: target.period,
        type: target.type,
        subtype: target.subtype,
        color: target.color,
        subcolor: target.color,
        require_limit: target.require_limit,
        booking_limit: target.booking_limit,
        forbid_yes: sortedYes,
        forbid_tdy: sortedTdy,
        forbid_tmr: sortedTmr,
      });

      setOriginalSymbol(target.symbol);

      setAllShifts(sortedAll.map((s) => s.symbol));
      setColorMap(
        Object.fromEntries(sortedAll.map((s) => [s.symbol, s.color])),
      );
      setSubtypeMap(
        Object.fromEntries(sortedAll.map((s) => [s.symbol, getTone2(s)])),
      );
    }

    loadAll();
  }, [id]); // ← ตามที่คุณต้องการ

  async function save() {
    const newSymbol = shift.symbol;
    const oldSymbol = originalSymbol;

    // ❗ ลบ id ออกจาก body ก่อน update (แก้ Supabase error 400)
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
