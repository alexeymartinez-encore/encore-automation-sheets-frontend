import TimesheetsTable from "./TimesheetComponents/TimesheetsTable";
import SectionHeader from "../Shared/SectionHeader";

export default function Timesheets() {
  return (
    <div className="w-full py-4 ">
      <SectionHeader
        section={"Timesheets"}
        link={"/employee-portal/dashboard/timesheets/create-timesheet"}
      />
      <TimesheetsTable />
    </div>
  );
}
