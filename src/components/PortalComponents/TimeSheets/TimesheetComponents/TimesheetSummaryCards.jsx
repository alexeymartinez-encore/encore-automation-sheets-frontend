import PropTypes from "prop-types";
import { formatDate } from "../../../../util/helper";

export default function TimesheetSummaryCards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      label: "Total hours logged",
      value: `${metrics.totalHours}h`,
      helper: `${metrics.submitted} submitted`,
    },
    {
      label: "Pending approvals",
      value: metrics.pending,
      helper: `${metrics.awaitingSignature} waiting for signature`,
    },
    {
      label: "Next timesheet due",
      value: formatDate(metrics.nextDue),
      helper: "Auto-calculated every Sunday",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="bg-white shadow-sm rounded-lg border border-slate-100 p-4 flex flex-col gap-1"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
          <p className="text-sm text-slate-500">{card.helper}</p>
        </article>
      ))}
    </div>
  );
}

TimesheetSummaryCards.propTypes = {
  metrics: PropTypes.shape({
    totalHours: PropTypes.number.isRequired,
    submitted: PropTypes.number.isRequired,
    pending: PropTypes.number.isRequired,
    awaitingSignature: PropTypes.number.isRequired,
    nextDue: PropTypes.instanceOf(Date).isRequired,
  }),
};
