import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi2";
import TimesheetStatusPill from "../TimesheetComponents/TimesheetStatusPill";
import { formatWeekendDate } from "../../../../util/helper";

export default function TimesheetDetailHeader({
  timesheet,
  status,
  totalHours,
}) {
  const navigate = useNavigate();

  const title = timesheet
    ? `Week ending ${formatWeekendDate(timesheet.week_ending)}`
    : "Loading timesheet…";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <HiArrowLeft />
          Back
        </button>
        {status && <TimesheetStatusPill label={status.label} tone={status.tone} />}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">
            Timesheet #{timesheet?.id ?? "-"}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 rounded-lg px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide">Total hours</p>
          <p className="text-3xl font-bold">{totalHours}h</p>
        </div>
      </div>
    </div>
  );
}

TimesheetDetailHeader.propTypes = {
  timesheet: PropTypes.object,
  status: PropTypes.shape({
    label: PropTypes.string,
    tone: PropTypes.string,
  }),
  totalHours: PropTypes.number.isRequired,
};
