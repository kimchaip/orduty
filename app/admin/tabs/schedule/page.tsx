import { Suspense } from "react";
import ScheduleTabsPage from "./ScheduleTabsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <ScheduleTabsPage />
    </Suspense>
  );
}
