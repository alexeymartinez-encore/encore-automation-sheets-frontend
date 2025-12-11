import PropTypes from "prop-types";
import { formatWeekendDate } from "../../../../util/helper";

export default function TimesheetMetaPanel({ timesheet, lifecycle }) {
  if (!timesheet) {
    return (
      <aside className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <p className="text-sm text-slate-500">Loading timesheet details…</p>
      </aside>
    );
  }

  const details = [
    {
      label: "Week ending",
      value: formatWeekendDate(timesheet.week_ending),
    },
    {
      label: "Submitted by",
      value: timesheet.submitted_by || "Not signed",
    },
    {
      label: "Message",
      value: timesheet.message || "No notes",
    },
    {
      label: "Approved by",
      value: timesheet.approved_by || "Pending",
    },
    {
      label: "Processed by",
      value: timesheet.processed_by || "Pending",
    },
  ];

  return (
    <aside className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Status
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {lifecycle.map((step) => (
            <span
              key={step.label}
              className={`px-2 py-1 text-xs rounded-full border ${
                step.active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-50 text-slate-500 border-slate-100"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {details.map((detail) => (
          <div key={detail.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {detail.label}
            </p>
            <p className="text-sm text-slate-800">{detail.value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

TimesheetMetaPanel.propTypes = {
  timesheet: PropTypes.object,
  lifecycle: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
    })
  ),
};
