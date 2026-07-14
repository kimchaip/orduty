"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function EditStaffPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<any>(null);

  const MAIN = ["ด", "ช", "บ"];
  const EXTEND = ["cvt", "avf", "uro", "fx"];
  const EXTRA = ["leader", "preop", "ortho"];
  const POSITION1 = ["RN", "NA"];
  const POSITION2 = [
    "ชำนาญการพิเศษ",
    "ชำนาญการ",
    "ปฏิบัติการ",
    "ลูกจ้างชั่วคราว",
    "ประจำ",
    "พกส",
  ];

  async function loadStaff() {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("id", id)
      .single();

    setStaff(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, [id]);

  function toggleMulti(field: string, value: string) {
    const arr = staff[field] || [];
    const updated = arr.includes(value)
      ? arr.filter((v: string) => v !== value)
      : [...arr, value];

    setStaff({ ...staff, [field]: updated });
  }

  async function saveStaff() {
    setSaving(true);

    await supabase.from("staff").update(staff).eq("id", id);

    setSaving(false);
    router.push("/admin");
  }

  if (loading) return <div className="text-gray-300 p-6">Loading...</div>;

  return (
    <div className="p-4 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => router.back()}
          className="text-gray-300 bg-gray-700 px-3 py-1 rounded"
        >
          Back
        </button>

        <h1 className="text-xl font-bold">Edit Staff</h1>

        <button
          onClick={saveStaff}
          disabled={saving}
          className="text-white bg-blue-600 px-3 py-1 rounded font-bold"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* fullname + name + lineID → column เดียว */}
        <div className="flex flex-col gap-4">
          <InputField
            label="Full Name"
            value={staff.full_name}
            onChange={(v) => setStaff({ ...staff, full_name: v })}
          />

          <InputField
            label="Name (short)"
            value={staff.name}
            onChange={(v) => setStaff({ ...staff, name: v })}
          />

          <InputField
            label="Line ID"
            value={staff.line_id}
            onChange={(v) => setStaff({ ...staff, line_id: v })}
          />
        </div>

        {/* 2 COLUMN LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Position 1 */}
            <SelectField
              label="Position 1"
              value={staff.position1}
              options={POSITION1}
              onChange={(v) => setStaff({ ...staff, position1: v })}
            />
          </div>
          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Position 2 */}
            <SelectField
              label="Position 2"
              value={staff.position2}
              options={POSITION2}
              onChange={(v) => setStaff({ ...staff, position2: v })}
            />
          </div>
        </div>

        {/* 3 COLUMN LAYOUT */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
          {/* LEFT COLUMN */}
          <div className="col-span-1 md:col-span-1">
            {/* Active */}
            <div className="flex flex-col items-center gap-4">
              <label className="text-gray-400 text-sm">Active</label>
              <input
                type="checkbox"
                className="scale-220 accent-blue-600"
                checked={!!staff.is_active}
                onChange={(e) =>
                  setStaff({ ...staff, is_active: e.target.checked })
                }
              />
            </div>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="col-span-1 md:col-span-1">
            {/* Color block */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-10 h-10 p-0 bg-transparent border-none"
                  value={staff.color || "#3b82f6"}
                  onChange={(e) =>
                    setStaff({ ...staff, color: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2 md:col-span-2">
            {/* Role */}
            <SelectField
              label="Role"
              value={staff.system_role}
              options={["staff", "admin"]}
              onChange={(v) => setStaff({ ...staff, system_role: v })}
            />
          </div>
        </div>

        {/* 2 COLUMN LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* main / extend / extra */}
            <MultiGroup
              title="Main"
              options={MAIN}
              field="main"
              staff={staff}
              toggle={toggleMulti}
            />

            <MultiGroup
              title="Extend"
              options={EXTEND}
              field="extend"
              staff={staff}
              toggle={toggleMulti}
            />

            <MultiGroup
              title="Extra"
              options={EXTRA}
              field="extra"
              staff={staff}
              toggle={toggleMulti}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            <MultiGroup
              title="Oncall Main"
              options={MAIN}
              field="oncall_main"
              staff={staff}
              toggle={toggleMulti}
            />

            <MultiGroup
              title="Oncall Extend"
              options={EXTEND}
              field="oncall_extend"
              staff={staff}
              toggle={toggleMulti}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Components ------------------ */

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <input
        className="w-full bg-gray-800 p-2 rounded mt-1"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <select
        className="w-full bg-gray-800 p-2 rounded mt-1"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiGroup({
  title,
  options,
  field,
  staff,
  toggle,
}: {
  title: string;
  options: string[];
  field: string;
  staff: any;
  toggle: (field: string, value: string) => void;
}) {
  const selected = staff[field] || [];

  return (
    <div>
      <label className="text-gray-400 text-sm mb-1 block">{title}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(field, opt)}
            className={`px-3 py-1 rounded text-sm ${
              selected.includes(opt)
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
