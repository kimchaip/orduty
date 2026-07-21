export type ShiftType = "main" | "extend" | "free" | "summit";
export type ShiftSubtype = "-" | "leader" | "ortho" | "preop" | "oncall";
export type ShiftPeriod = "ด" | "ช" | "บ";
export type Shift = {
  id?: number;
  name: string;
  symbol: string;
  type: ShiftType;
  subtype: ShiftSubtype;
  period: ShiftPeriod;
  color: string;
  subcolor: string;
  require_limit: number;
  booking_limit: number;
  forbid_yes: string[];
  forbid_tdy: string[];
  forbid_tmr: string[];
};

export const typeOrder: Record<ShiftType, number> = {
  main: 1,
  extend: 2,
  free: 3,
  summit: 4,
};

export const subtypeOrder: Record<ShiftSubtype, number> = {
  "-": 1,
  leader: 2,
  ortho: 3,
  preop: 4,
  oncall: 5,
};

export const periodOrder: Record<ShiftPeriod, number> = {
  "ด": 1,
  "ช": 2,
  "บ": 3,
};

export function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) => {
    // 1) type
    const typeDiff = typeOrder[a.type] - typeOrder[b.type];
    if (typeDiff !== 0) return typeDiff;

    // 2) subtype
    const subtypeDiff = subtypeOrder[a.subtype] - subtypeOrder[b.subtype];
    if (subtypeDiff !== 0) return subtypeDiff;

    // 3) period
    const periodDiff = periodOrder[a.period] - periodOrder[b.period];
    if (periodDiff !== 0) return periodDiff;

    // 4) symbol asc
    return a.symbol.localeCompare(b.symbol);
  });
}
