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
  onChange: (s: Shift) => void;
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
          onChange={(v) => onChange({ ...shift, name: v })}
        />

        <Input
          label="Symbol"
          value={shift.symbol}
          onChange={(v) => onChange({ ...shift, symbol: v })}
        />

        <Select<ShiftPeriod>
          label="Period"
          value={shift.period}
          options={["ด", "ช", "บ"]}
          onChange={(v) => onChange({ ...shift, period: v })}
        />

        <Input
          label="Color"
          type="color"
          value={shift.color}
          onChange={(v) => onChange({ ...shift, color: v })}
        />

        <Select<ShiftType>
          label="Type"
          value={shift.type}
          options={["main", "extend", "free", "summit"]}
          onChange={(v) => onChange({ ...shift, type: v })}
        />

        <Select<ShiftSubtype>
          label="Subtype"
          value={shift.subtype}
          options={["-", "leader", "preop", "ortho", "oncall"]}
          onChange={(v) => onChange({ ...shift, subtype: v })}
        />

        <Input
          label="Require Limit"
          type="number"
          value={shift.require_limit}
          onChange={(v) => onChange({ ...shift, require_limit: Number(v) })}
        />

        <Input
          label="Booking Limit"
          type="number"
          value={shift.booking_limit}
          onChange={(v) => onChange({ ...shift, booking_limit: Number(v) })}
        />
      </div>

      {/* forbid_yes → แสดงทุกเวร */}
      <TagGroup label="Forbid Yes">
        <ColorMultiSelect
          value={shift.forbid_yes}
          options={allShifts}
          colorMap={colorMap}
          subtypeMap={subtypeMap}
          onChange={(v) => onChange({ ...shift, forbid_yes: v })}
        />
      </TagGroup>

      {/* forbid_tdy → ไม่แสดงเวรตัวเอง */}
      <TagGroup label="Forbid Today">
        <ColorMultiSelect
          value={shift.forbid_tdy}
          options={allShifts.filter((s) => s !== shift.symbol)}
          colorMap={colorMap}
          subtypeMap={subtypeMap}
          onChange={(v) => onChange({ ...shift, forbid_tdy: v })}
        />
      </TagGroup>

      {/* forbid_tmr → แสดงทุกเวร */}
      <TagGroup label="Forbid Tomorrow">
        <ColorMultiSelect
          value={shift.forbid_tmr}
          options={allShifts}
          colorMap={colorMap}
          subtypeMap={subtypeMap}
          onChange={(v) => onChange({ ...shift, forbid_tmr: v })}
        />
      </TagGroup>

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

function TagGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 p-2 rounded border border-gray-700">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex flex-wrap gap-2 min-h-[24px]">{children}</div>
    </div>
  );
}

function ColorMultiSelect({
  value,
  options,
  colorMap,
  subtypeMap,
  onChange,
}: {
  value: string[];
  options: string[];
  colorMap: Record<string, string>;
  subtypeMap: Record<string, string>;
  onChange: (v: string[]) => void;
}) {
  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <>
      {options.map((o) => (
        <SymbolTag
          key={o}
          symbol={o}
          color={colorMap[o] ?? "#666"}
          subtypeColor={subtypeMap[o] ?? colorMap[o] ?? "#666"}
          active={value.includes(o)}
          onClick={() => toggle(o)}
        />
      ))}
    </>
  );
}

function SymbolTag({
  symbol,
  color,
  subtypeColor,
  active,
  onClick,
}: {
  symbol: string;
  color: string;
  subtypeColor: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-xs rounded font-bold text-black border border-gray-600 relative"
      style={{
        backgroundColor: color,
        opacity: active ? 1 : 0.4,
      }}
    >
      {symbol}

      {/* แถบสีด้านล่าง */}
      <div
        className="absolute left-0 bottom-0 w-full h-1 rounded-b"
        style={{ backgroundColor: subtypeColor }}
      />
    </button>
  );
}

type InputProps = {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
};

function Input({ label, value, onChange, type = "text" }: InputProps) {
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

type SelectProps<T extends string> = {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
};

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
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
