import { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { TimesheetContext } from "../../../store/timesheet-context";
import { ExpensesContext } from "../../../store/expense-context";
import {
  buildDashboardDeadlines,
  getDeadlineUrgencyClasses,
} from "../../../util/dashboardDeadlines";

function DeadlineRow({ item }) {
  return (
    <Link
      to={item.link}
      state={item.state}
      className={`block border rounded-md px-3 py-2 transition-colors ${getDeadlineUrgencyClasses(
        item.urgency
      )}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">{item.type}</p>
        <p className="text-[0.68rem]">{item.overdue ? "Overdue" : "Upcoming"}</p>
      </div>
      <p className="text-sm">{item.title}</p>
      <p className="text-xs opacity-90">{item.meta}</p>
    </Link>
  );
}

DeadlineRow.propTypes = {
  item: PropTypes.shape({
    link: PropTypes.string.isRequired,
    state: PropTypes.object,
    urgency: PropTypes.oneOf(["blue", "orange", "red"]).isRequired,
    type: PropTypes.string.isRequired,
    overdue: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    meta: PropTypes.string.isRequired,
  }).isRequired,
};

export default function TasksAndDeadlinesSection() {
  const { timesheets = [] } = useContext(TimesheetContext);
  const { expenses = [] } = useContext(ExpensesContext);

  const { overdueItems, upcomingItems } = useMemo(() => {
    return buildDashboardDeadlines({ timesheets, expenses });
  }, [timesheets, expenses]);

  return (
    <div className="bg-white shadow-xs rounded-lg p-5">
      <h1 className="text-2xl text-blue-500">Tasks & Deadlines</h1>
      <p className="text-xs text-gray-500 mt-1">
        Timecards are due Sunday. Expenses are due on the last day of the month.
      </p>

      <div className="mt-4 rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
        <div className="grid grid-cols-1 divide-y divide-gray-300">
          <section className="min-h-[180px] bg-white p-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-red-500 pl-3">
              <h2 className="text-base text-red-600 font-semibold">Overdue Tasks</h2>
              <p className="text-xs text-gray-500">
                {overdueItems.length} {overdueItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {overdueItems.length === 0 ? (
                <p className="text-sm text-gray-500">No overdue timecards or expenses.</p>
              ) : (
                overdueItems.map((item) => <DeadlineRow key={item.id} item={item} />)
              )}
            </div>
          </section>

          <section className="min-h-[180px] bg-white p-4">
            <div className="flex items-center justify-between gap-2 border-l-4 border-blue-500 pl-3">
              <h2 className="text-base text-blue-600 font-semibold">Upcoming Deadlines</h2>
              <p className="text-xs text-gray-500">
                {upcomingItems.length}{" "}
                {upcomingItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {upcomingItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No upcoming missing timecards or expenses.
                </p>
              ) : (
                upcomingItems.map((item) => <DeadlineRow key={item.id} item={item} />)
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
