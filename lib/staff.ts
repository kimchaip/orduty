import { supabase } from "@/lib/supabase";

export async function updateStaffOrder(
  staffId: string,
  newDutyOrder: number,
  newDisplayOrder: number,
  newColor: string,
) {
    
  const { data: oldStaff, error } = await supabase
    .from("staff")
    .select("duty_order, display_order")
    .eq("id", staffId)
    .single();

  if (error || !oldStaff) {
    console.error("❌ ไม่พบ staff เดิมสำหรับ reorder");
    return;
  }

  const oldDutyOrder = oldStaff.duty_order;
  const oldDisplayOrder = oldStaff.display_order;

  if (newDutyOrder !== oldDutyOrder) {
    await supabase.rpc("shift_duty_order", {
      staff_id: staffId,
      new_order: newDutyOrder,
    });
  }

  if (newDisplayOrder !== oldDisplayOrder) {
    await supabase.rpc("shift_display_order", {
      staff_id: staffId,
      new_order: newDisplayOrder,
    });
  }

  // ⭐ โหลดค่าจริงหลัง RPC ทำงาน
  const { data: refreshed } = await supabase
    .from("staff")
    .select("duty_order, display_order")
    .eq("id", staffId)
    .single();

  // ⭐ ป้องกัน null
  if (!refreshed) {
    console.warn("⚠ refreshed is null");
    return null;
  }

  // ⭐ update เฉพาะ color
  await supabase
    .from("staff")
    .update({ color: newColor })
    .eq("id", staffId);

  // ⭐ ส่งค่าที่ถูกต้องกลับไปให้ dashboard
  return {
    duty_order: refreshed.duty_order,
    display_order: refreshed.display_order,
  };
}
