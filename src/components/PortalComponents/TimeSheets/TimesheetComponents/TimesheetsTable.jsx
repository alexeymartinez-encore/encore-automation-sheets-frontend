import { useContext, useMemo } from "react";
import TableContentHeader from "./TableContentHeader";
import TableContentRows from "./TableContentRows";
import { TimesheetContext } from "../../../../store/timesheet-context";

export default function TimesheetsTable() {
  const timesheetCtx = useContext(TimesheetContext);
  const { timesheets = [] } = timesheetCtx;

  const sortedTimesheets = useMemo(() => {
    return [...timesheets].sort((a, b) => {
      const da = a?.week_ending ? new Date(a.week_ending).getTime() : 0;
      const db = b?.week_ending ? new Date(b.week_ending).getTime() : 0;
      return db - da; // newest first
    });
  }, [timesheets]);

  return (
    <div className="flex flex-col bg-white h-full shadow-md rounded-md my-5 text-[0.7rem]">
      <TableContentHeader />
      <div className="flex flex-col py-0 md:py-5">
        {sortedTimesheets.map((t) => (
          <TableContentRows key={t.id} timesheet={t} />
        ))}
      </div>
    </div>
  );
}
