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

  const [shift, setShift] = useState<Shift>({
    name: "",
    symbol: "",
    type: "main",
    subtype: "-",
    period: "ช",
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

  // โหลดข้อมูล shift ทั้งหมด + sort + colorMap + subtypeMap + sort tag ของเวรนี้
  useEffect(() => {
    async function loadAll() {
      // โหลด shift ทั้งหมด
      const { data: all } = await supabase.from("shift").select("*");
      if (!all) return;

      const sortedAll = sortShifts(all);

      // โหลด shift ที่ต้องการแก้ไข
      const { data: target } = await supabase
        .from("shift")
        .select("*")
        .eq("id", id)
        .single();

      if (!target) return;

      // sort tag ของเวรนี้
      const sortedYes = sortedAll
        .filter((s) => target.forbid_yes?.includes(s.symbol))
        .map((s) => s.symbol);

      const sortedTdy = sortedAll
        .filter((s) => target.forbid_tdy?.includes(s.symbol))
        .map((s) => s.symbol);

      const sortedTmr = sortedAll
        .filter((s) => target.forbid_tmr?.includes(s.symbol))
        .map((s) => s.symbol);

      // setShift
      setShift({
        id: target.id,
        name: target.name,
        symbol: target.symbol,
        period: target.period,
        type: target.type,
        subtype: target.subtype,
        color: target.color,
        require_limit: target.require_limit,
        booking_limit: target.booking_limit,
        forbid_yes: sortedYes,
        forbid_tdy: sortedTdy,
        forbid_tmr: sortedTmr,
      });

      setOriginalSymbol(target.symbol);

      // set allShifts + colorMap
      setAllShifts(sortedAll.map((s) => s.symbol));
      setColorMap(Object.fromEntries(sortedAll.map((s) => [s.symbol, s.color])));

      // set subtypeMap สำหรับ tag 2-tone
      setSubtypeMap(
        Object.fromEntries(
          sortedAll.map((s) => [s.symbol, getTone2(s)])
        )
      );
    }

    loadAll();
  }, [id]);

  async function save() {
    const newSymbol = shift.symbol;
    const oldSymbol = originalSymbol;

    // อัปเดตเวรนี้
    await supabase
      .from("shift")
      .update({
        ...shift,
        symbol: newSymbol,
        forbid_yes: [...shift.forbid_yes],
        forbid_tdy: [...shift.forbid_tdy],
        forbid_tmr: [...shift.forbid_tmr],
      })
      .eq("id", id);

    // ถ้า symbol เปลี่ยน → update forbid ของเวรอื่น
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
        onChange={setShift}
        onSave={save}
        onCancel={() => router.push("/admin/shift")}
      />
    </div>
  );
}
