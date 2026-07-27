"use client";

import { Shift, ShiftPeriod, ShiftType, ShiftSubtype } from "@/lib/shift";

export function ShiftForm({
  shift,
  allShifts,
  colorMap,
  subtypeMap,
  onChange,
  onSave,
  onCancel,
}: {
  shift: Shift;
  allShifts: string[];
  colorMap: Record<string, string>;
  subtypeMap: Record<string, string>;
  onChange: (field: keyof Shift, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">

      {/* GRID INPUTS */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <Input
          label="Name"
          value={shift.name}
          onChange={(v) => onChange("name", v)}
        />

        <Input
          label="Symbol"
          value={shift.symbol}
          onChange={(v) => onChange("symbol", v)}
        />

        <Select<ShiftPeriod>
          label="Period"
          value={shift.period}
          options={["ด", "ช", "บ"]}
          onChange={(v) => onChange("period", v)}
        />

        <Select<ShiftType>
          label="Type"
          value={shift.type}
          options={["main", "extend", "free", "summit"]}
          onChange={(v) => onChange("type", v)}
        />

        <Select<ShiftSubtype>
          label="Subtype"
          value={shift.subtype}
          options={["-", "leader", "preop", "ortho", "oncall"]}
          onChange={(v) => onChange("subtype", v)}
        />

        <Input
          label="Require Limit"
          type="number"
          value={shift.require_limit}
          onChange={(v) => onChange("require_limit", Number(v))}
        />

        <Input
          label="Booking Limit"
          type="number"
          value={shift.booking_limit}
          onChange={(v) => onChange("booking_limit", Number(v))}
        />
      </div>

      {/* ปุ่ม Cancel / Save */}
      <div className="flex justify-between mt-4">
        <button
          onClick={onCancel}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={onSave}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Input({ label, value, onChange, type = "text" }: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <input
        type={type}
        className="w-full bg-gray-800 p-2 rounded mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <select
        className="w-full bg-gray-800 p-2 rounded mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
