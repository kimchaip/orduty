export interface CalendarDay {
  id: number;
  date: string;
  dow: number;
  is_holiday: boolean;
  is_lastholiday: boolean;
  holiday_name: string | null;
  created_at: string;
  updated_at: string;
}
