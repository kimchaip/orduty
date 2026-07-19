"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { updateStaffOrder } from "@/lib/staff";
import { useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ---------- SortableItem (รวมไว้ในไฟล์เดียว) ----------
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// ---------- StaffTab หลัก ----------
export default function StaffListPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderMode, setOrderMode] = useState<"duty" | "display">("duty");
  const [search, setSearch] = useState("");

  const filteredStaff = staff.filter((s) => {
    const keywords = search
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((k) => k.trim() !== "");

    if (keywords.length === 0) return true;

    const haystack = [
      s.full_name,
      s.name,
      s.system_role,
      s.position1,
      s.position2,
      JSON.stringify(s.main),
      JSON.stringify(s.extra),
      JSON.stringify(s.extend),
      JSON.stringify(s.oncall_main),
      JSON.stringify(s.oncall_extend),
    ]
      .join(" ")
      .toLowerCase();

    // OR search — คำไหนก็ได้
    return keywords.every((kw) => haystack.includes(kw));
  });

  async function loadStaff(mode: "duty" | "display" = orderMode) {
    const orderColumn = mode === "duty" ? "duty_order" : "display_order";

    const { data } = await supabase
      .from("staff")
      .select("*")
      .order(orderColumn, { ascending: true });

    setStaff(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff(orderMode);
  }, [orderMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = staff.findIndex((s) => s.id === active.id);
    const newIndex = staff.findIndex((s) => s.id === over.id);

    const newList = arrayMove(staff, oldIndex, newIndex);
    setStaff(newList);

    // update order ตาม mode ที่เลือก
    for (let i = 0; i < newList.length; i++) {
      const s = newList[i];

      if (orderMode === "duty") {
        await updateStaffOrder(s.id, i + 1, s.display_order, s.color);
      } else {
        await updateStaffOrder(s.id, s.duty_order, i + 1, s.color);
      }
    }

    loadStaff(orderMode);
  }

  if (loading) return <p className="text-gray-300">Loading...</p>;

  return (
    <div>
      {/* แถวบน: title + sort switch */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-200">ตั้งค่าคน</h2>

        <div className="flex items-center">
          <label className="text-gray-300 text-sm mr-2">Sort:</label>
          <select
            value={orderMode}
            onChange={(e) => setOrderMode(e.target.value as "duty" | "display")}
            className="bg-gray-700 text-white p-1 rounded text-sm"
          >
            <option value="duty">Duty Order</option>
            <option value="display">Display Order</option>
          </select>
        </div>
      </div>
      <div className="flex items-center mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา.. เช่น ช,บ"
          className="bg-gray-700 text-white p-2 rounded w-full text-sm"
        />
      </div>

      {/* list + drag&drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={staff.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {filteredStaff.map((s) => (
              <SortableItem key={s.id} id={s.id}>
                <StaffCard s={s} router={router} />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ---------- StaffCard layout ----------
function StaffCard({
  s,
  router,
}: {
  s: any;
  router: ReturnType<typeof useRouter>;
}) {
  const barColor = !s.is_active
    ? "#6b7280"
    : s.system_role === "admin"
      ? "#facc15"
      : "#3b82f6";

  const main = JSON.stringify(s.main);
  const extra = JSON.stringify(s.extra);
  const extend = JSON.stringify(s.extend);
  const mainOncall = JSON.stringify(s.oncall_main);
  const extendOncall = JSON.stringify(s.oncall_extend);

  return (
    <div
      onClick={() => router.push(`/admin/staff/${s.id}`)}
      className="bg-gray-800 rounded p-3 border border-gray-700 flex gap-3 text-sm leading-tight cursor-pointer active:scale-[0.98]"
    >
      {/* แถบสีแนวตั้ง */}
      <div className="w-2 rounded" style={{ backgroundColor: barColor }} />

      {/* เนื้อหา */}
      <div className="flex-1 overflow-hidden">
        <div className="font-bold text-gray-200 truncate">{s.full_name}</div>

        <div className="text-gray-400 truncate">
          {s.position1} / {s.position2}
        </div>

        {/* main + extra + main_oncall */}
        <div className="flex justify-between mt-1 text-gray-300 text-xs">
          <span className="truncate">
            {main} {extra ? `/ (${extra})` : ""}
          </span>
          <span className="truncate">{mainOncall}</span>
        </div>

        {/* extend + extend_oncall */}
        <div className="flex justify-between mt-1 text-gray-300 text-xs">
          <span className="truncate">{extend}</span>
          <span className="truncate">{extendOncall}</span>
        </div>
      </div>
    </div>
  );
}
