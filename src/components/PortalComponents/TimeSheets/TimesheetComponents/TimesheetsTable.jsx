import { useContext, useMemo } from "react";
import TableContentHeader from "./TableContentHeader";
import TableContentRows from "./TableContentRows";
import { TimesheetContext } from "../../../../store/timesheet-context";
import LoadingState from "../../Shared/LoadingState";

export default function TimesheetsTable() {
  const timesheetCtx = useContext(TimesheetContext);
  const { timesheets = [], isLoading } = timesheetCtx;

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
        {isLoading ? (
          <LoadingState
            label="Loading timesheets..."
            className="bg-transparent py-10"
          />
        ) : sortedTimesheets.length > 0 ? (
          sortedTimesheets.map((timesheet) => (
            <TableContentRows key={timesheet.id} timesheet={timesheet} />
          ))
        ) : (
          <p className="px-4 py-8 text-center text-xs text-slate-500">
            No timesheets found.
          </p>
        )}
      </div>
    </div>
  );
}
