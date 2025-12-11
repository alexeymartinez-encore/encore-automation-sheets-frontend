import PropTypes from "prop-types";

export default function WeeklyTrend({ trend = [] }) {
  if (!trend?.length) {
    return (
      <section className="bg-white shadow-xs rounded-lg p-5">
        <h2 className="text-xl text-blue-500 font-semibold mb-2">
          Weekly Hours Trend
        </h2>
        <p className="text-sm text-gray-500">
          Submit your first timesheet to start tracking weekly hours.
        </p>
      </section>
    );
  }

  const maxValue =
    trend.reduce((max, entry) => Math.max(max, entry.value), 0) || 1;

  return (
    <section className="bg-white shadow-xs rounded-lg p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h2 className="text-xl text-blue-500 font-semibold">
          Weekly Hours Trend
        </h2>
        <p className="text-xs text-gray-400">
          Last {trend.length} submitted weeks
        </p>
      </div>

      <div className="flex items-end gap-4">
        {trend.map((entry) => {
          const heightPercent = Math.max(
            10,
            (entry.value / maxValue) * 100
          );
          return (
            <div
              key={entry.label}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full bg-blue-50 rounded-md h-32 flex items-end overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-md transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-600">
                {entry.value}h
              </p>
              <p className="text-xs text-gray-400">{entry.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

WeeklyTrend.propTypes = {
  trend: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
};
