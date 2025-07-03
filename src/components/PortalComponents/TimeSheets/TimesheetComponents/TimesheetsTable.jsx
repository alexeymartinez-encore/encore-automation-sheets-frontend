import { useContext } from "react";
import TableContentHeader from "./TableContentHeader";
import TableContentRows from "./TableContentRows";
import { TimesheetContext } from "../../../../store/timesheet-context";

export default function TimesheetsTable() {
  const timesheetCtx = useContext(TimesheetContext);
  // console.log(timesheetCtx.timesheets);
  return (
    <div className="flex flex-col bg-white h-full shadow-md rounded-md my-5  text-[0.7rem] ">
      <TableContentHeader />
      <div className="flex flex-col py-0 md:py-5 ">
        {timesheetCtx.timesheets.map((timesheet) => (
          <TableContentRows key={timesheet.id} timesheet={timesheet} />
        ))}
      </div>
    </div>
  );
}
