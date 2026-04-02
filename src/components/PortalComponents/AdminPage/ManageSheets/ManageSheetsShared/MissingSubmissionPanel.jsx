import PropTypes from "prop-types";

function formatLastActivity(value) {
  if (!value) return "No draft activity yet";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "No draft activity yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getStatusLabel(status) {
  return status === "draft" ? "Draft saved" : "Not started";
}

export default function MissingSubmissionPanel({
  title,
  periodLabel,
  missingEmployees,
  activeEmployeeCount,
  completedCount,
  isLoading,
  isSendingAll,
  sendingEmployeeIds,
  onRefresh,
  onSendAll,
  onSendSingle,
  emptyMessage,
}) {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-amber-200 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Submission Audit
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{periodLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            Active: {activeEmployeeCount}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
            Complete: {completedCount}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700">
            Missing: {missingEmployees.length}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onSendAll}
            className="rounded-md bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
            disabled={
              isLoading || isSendingAll || missingEmployees.length === 0
            }
          >
            {isSendingAll ? "Sending..." : "Send All Reminders"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-6 text-sm text-gray-500">Loading missing employees...</div>
      ) : missingEmployees.length === 0 ? (
        <div className="py-6 text-sm text-gray-600">{emptyMessage}</div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {missingEmployees.map((employee) => {
            const isSendingSingle = sendingEmployeeIds.includes(employee.id);
            return (
              <div
                key={employee.id}
                className="grid gap-3 rounded-md border border-amber-100 bg-white p-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {employee.last_name}, {employee.first_name}
                  </p>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      employee.submission_status === "draft"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusLabel(employee.submission_status)}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    Last activity: {formatLastActivity(employee.last_activity_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSendSingle(employee.id)}
                  className="rounded-md border border-amber-300 px-3 py-2 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-amber-200 disabled:text-amber-400"
                  disabled={isSendingSingle || isSendingAll}
                >
                  {isSendingSingle ? "Sending..." : "Send Reminder"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

MissingSubmissionPanel.propTypes = {
  title: PropTypes.string.isRequired,
  periodLabel: PropTypes.string.isRequired,
  missingEmployees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      email: PropTypes.string,
      submission_status: PropTypes.string,
      last_activity_at: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
    })
  ).isRequired,
  activeEmployeeCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSendingAll: PropTypes.bool.isRequired,
  sendingEmployeeIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onRefresh: PropTypes.func.isRequired,
  onSendAll: PropTypes.func.isRequired,
  onSendSingle: PropTypes.func.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};
