import PropTypes from "prop-types";
import TimesheetCard from "./TimesheetCard";

export default function TimesheetList({ timesheets, onDelete }) {
  if (!timesheets.length) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
        <p className="text-lg font-semibold text-slate-700">
          No timesheets yet
        </p>
        <p className="text-sm text-slate-500">
          Create your first timesheet to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {timesheets.map((timesheet) => (
        <TimesheetCard
          key={timesheet.id}
          timesheet={timesheet}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

TimesheetList.propTypes = {
  timesheets: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
};
