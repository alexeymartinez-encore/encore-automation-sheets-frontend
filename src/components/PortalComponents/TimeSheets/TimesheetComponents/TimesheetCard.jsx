import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { HiOutlineTrash, HiOutlineArrowRight } from "react-icons/hi";
import TimesheetStatusPill from "./TimesheetStatusPill";
import { formatWeekendDate } from "../../../../util/helper";
import {
  getTimesheetLifecycle,
  getTimesheetStatus,
  getTimesheetTotalHours,
} from "../../../../util/timesheet";

export default function TimesheetCard({ timesheet, onDelete }) {
  const navigate = useNavigate();
  const status = getTimesheetStatus(timesheet);
  const totalHours = getTimesheetTotalHours(timesheet);
  const lifecycle = getTimesheetLifecycle(timesheet);
  const formattedDate = formatWeekendDate(timesheet.week_ending);

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Week ending
          </p>
          <h3 className="text-2xl font-semibold text-slate-900">
            {formattedDate}
          </h3>
        </div>
        <TimesheetStatusPill label={status.label} tone={status.tone} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Metric label="Total hours" value={`${totalHours}h`} />
        <Metric
          label="Regular"
          value={`${Number(timesheet.total_reg_hours || 0)}h`}
        />
        <Metric
          label="Overtime"
          value={`${Number(timesheet.total_overtime || 0)}h`}
        />
        <Metric
          label="Submitted by"
          value={timesheet.submitted_by || "Not signed"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {lifecycle.map((step) => (
          <span
            key={step.label}
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              step.active
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(`/employee-portal/dashboard/timesheets/${timesheet.id}`)
          }
          className="inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 transition"
        >
          Open details
          <HiOutlineArrowRight />
        </button>
        <button
          type="button"
          disabled={Boolean(timesheet.approved)}
          onClick={() => onDelete(timesheet.id)}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium border ${
            timesheet.approved
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          <HiOutlineTrash />
          Delete
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex flex-col">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

Metric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

TimesheetCard.propTypes = {
  timesheet: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};
