import PropTypes from "prop-types";

const toneMap = {
  gray: "bg-slate-100 text-slate-600",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export default function TimesheetStatusPill({ label, tone = "gray" }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${toneMap[tone] || toneMap.gray}`}
    >
      {label}
    </span>
  );
}

TimesheetStatusPill.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["gray", "amber", "blue", "emerald"]),
};
