import PropTypes from "prop-types";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "processed", label: "Processed" },
];

export default function TimesheetFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex-1 w-full">
        <label htmlFor="timesheet-search" className="sr-only">
          Search timesheets
        </label>
        <input
          id="timesheet-search"
          type="search"
          placeholder="Search by week ending or note..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onStatusChange(filter.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              statusFilter === filter.key
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

TimesheetFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
