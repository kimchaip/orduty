"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ShiftColorSetting() {
  const [colors, setColors] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("color").select("*").order("id");
      setColors(data || []);
    }
    load();
  }, []);

  async function updateColor(id: number, newColor: string) {
    await supabase.from("color").update({ color: newColor }).eq("id", id);

    // update shift.color
    await supabase.rpc("update_shift_color");

    // update shift.subcolor
    await supabase.rpc("update_shift_subcolor");

    const { data } = await supabase.from("color").select("*").order("id");
    setColors(data || []);
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Shift Color Setting</h1>

      {colors.map((c) => (
        <div key={c.id} className="flex items-center gap-4 mb-3">
          <div className="w-40">
            {c.title || `${c.type}/${c.period}` || c.subtype}
          </div>

          <input
            type="color"
            value={c.color}
            onChange={(e) => updateColor(c.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
