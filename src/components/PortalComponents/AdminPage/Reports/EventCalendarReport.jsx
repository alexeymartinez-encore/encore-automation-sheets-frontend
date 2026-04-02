import { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FiChevronDown } from "react-icons/fi";
import { EventContext } from "../../../../store/events-context";
import { UserContext } from "../../../../store/user-context";
import { toDateOnly } from "../../../../util/dateOnly";

function toCsv(rows) {
  if (!rows.length) return "";

  const headers = [
    "Employee",
    "Event Type",
    "Start Date",
    "End Date",
    "Holiday",
    "Details",
    "Display Text",
  ];

  const contentRows = rows.map((row) => [
    row.employee_name || "",
    row.event_type_label || "",
    row.start || "",
    row.end_date || "",
    row.is_holiday ? "Yes" : "No",
    row.details || "",
    row.title || "",
  ]);

  return [headers, ...contentRows]
    .map((entry) =>
      entry
        .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export default function EventCalendarReport({ isEmbedded = false }) {
  const eventCtx = useContext(EventContext);
  const userCtx = useContext(UserContext);

  const today = toDateOnly(new Date());
  const defaultStart = `${today.slice(0, 8)}01`;

  const [filters, setFilters] = useState({
    start: defaultStart,
    end: today,
    search: "",
    userId: "",
    eventTypeId: "",
  });

  const userDropdownRef = useRef(null);
  const eventTypeDropdownRef = useRef(null);
  const [userSearchText, setUserSearchText] = useState("");
  const [eventTypeSearchText, setEventTypeSearchText] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isEventTypeDropdownOpen, setIsEventTypeDropdownOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [summaryByType, setSummaryByType] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function bootstrapFilters() {
      const [employeeData, eventTypeData] = await Promise.all([
        userCtx.getAllEmployees(),
        eventCtx.fetchEventTypes(true),
      ]);

      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setEventTypes(Array.isArray(eventTypeData) ? eventTypeData : []);
    }

    bootstrapFilters();
  }, [eventCtx, userCtx, eventCtx.updated]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }

      if (
        eventTypeDropdownRef.current &&
        !eventTypeDropdownRef.current.contains(event.target)
      ) {
        setIsEventTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) =>
        `${a.last_name}, ${a.first_name}`.localeCompare(
          `${b.last_name}, ${b.first_name}`
        )
      ),
    [employees]
  );

  const sortedEventTypes = useMemo(
    () =>
      [...eventTypes].sort((a, b) =>
        String(a.label || "").localeCompare(String(b.label || ""))
      ),
    [eventTypes]
  );

  const filteredEmployeeOptions = useMemo(() => {
    const term = userSearchText.trim().toLowerCase();
    if (!term) return sortedEmployees;

    return sortedEmployees.filter((employee) =>
      `${employee.last_name}, ${employee.first_name}`
        .toLowerCase()
        .includes(term)
    );
  }, [sortedEmployees, userSearchText]);

  const filteredEventTypeOptions = useMemo(() => {
    const term = eventTypeSearchText.trim().toLowerCase();
    if (!term) return sortedEventTypes;

    return sortedEventTypes.filter((eventType) =>
      String(eventType.label || "").toLowerCase().includes(term)
    );
  }, [sortedEventTypes, eventTypeSearchText]);

  async function runReport(event) {
    event?.preventDefault();

    if (!filters.start || !filters.end) {
      eventCtx.triggerSucessOrFailMessage(
        "fail",
        "Start and end dates are required."
      );
      return;
    }

    setIsLoading(true);
    const reportData = await eventCtx.fetchEventReport({
      start: filters.start,
      end: filters.end,
      employeeIds: filters.userId ? [Number(filters.userId)] : [],
      eventTypeIds: filters.eventTypeId ? [Number(filters.eventTypeId)] : [],
      search: filters.search,
    });
    setIsLoading(false);

    setReportRows(reportData.rows || []);
    setSummaryByType(reportData.summaryByType || {});
    setTotalCount(reportData.total || 0);
  }

  function handleSelectUser(userId, label = "") {
    setFilters((prev) => ({
      ...prev,
      userId: userId ? String(userId) : "",
    }));
    setUserSearchText(label);
    setIsUserDropdownOpen(false);
  }

  function handleSelectEventType(typeId, label = "") {
    setFilters((prev) => ({
      ...prev,
      eventTypeId: typeId ? String(typeId) : "",
    }));
    setEventTypeSearchText(label);
    setIsEventTypeDropdownOpen(false);
  }

  function exportCsv() {
    if (reportRows.length === 0) return;

    const csv = toCsv(reportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "event-calendar-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`${isEmbedded ? "" : "my-5 "}flex flex-col gap-6`}>
      {!isEmbedded ? (
        <div className="bg-white shadow-sm rounded-md p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Event Calendar Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Run calendar reports by date range, user(s), event type(s), and
            text.
          </p>
        </div>
      ) : null}

      <div className="bg-white shadow-sm rounded-md p-4">
        <form
          onSubmit={runReport}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Start Date
            <input
              type="date"
              value={filters.start}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  start: event.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            End Date
            <input
              type="date"
              value={filters.end}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  end: event.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
            Text Search
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              placeholder="Name, details, or event type"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm transition disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Running..." : "Run Report"}
            </button>
            <button
              type="button"
              className="rounded-md bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm transition disabled:opacity-60"
              disabled={reportRows.length === 0}
              onClick={exportCsv}
            >
              Export CSV
            </button>
          </div>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
            User
            <div className="relative" ref={userDropdownRef}>
              <input
                type="text"
                value={userSearchText}
                onFocus={() => setIsUserDropdownOpen(true)}
                onChange={(event) => {
                  setUserSearchText(event.target.value);
                  setFilters((prev) => ({ ...prev, userId: "" }));
                  setIsUserDropdownOpen(true);
                }}
                placeholder="All users"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm bg-white"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                aria-label="Toggle user options"
              >
                <FiChevronDown className="h-4 w-4" />
              </button>

              {isUserDropdownOpen ? (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    onClick={() => handleSelectUser("", "")}
                  >
                    All users
                  </button>
                  {filteredEmployeeOptions.map((employee) => {
                    const label = `${employee.last_name}, ${employee.first_name}`;
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                        onClick={() => handleSelectUser(employee.id, label)}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {filteredEmployeeOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No matching users
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
            Event Type
            <div className="relative" ref={eventTypeDropdownRef}>
              <input
                type="text"
                value={eventTypeSearchText}
                onFocus={() => setIsEventTypeDropdownOpen(true)}
                onChange={(event) => {
                  setEventTypeSearchText(event.target.value);
                  setFilters((prev) => ({ ...prev, eventTypeId: "" }));
                  setIsEventTypeDropdownOpen(true);
                }}
                placeholder="All types"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm bg-white"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition"
                onClick={() => setIsEventTypeDropdownOpen((prev) => !prev)}
                aria-label="Toggle event type options"
              >
                <FiChevronDown className="h-4 w-4" />
              </button>

              {isEventTypeDropdownOpen ? (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    onClick={() => handleSelectEventType("", "")}
                  >
                    All types
                  </button>
                  {filteredEventTypeOptions.map((eventType) => (
                    <button
                      key={eventType.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                      onClick={() =>
                        handleSelectEventType(eventType.id, eventType.label)
                      }
                    >
                      {eventType.label}
                    </button>
                  ))}
                  {filteredEventTypeOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No matching event types
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </label>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-md p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="rounded-md border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Rows
            </p>
            <p className="text-lg font-semibold text-gray-800">{totalCount}</p>
          </div>

          {Object.keys(summaryByType).length > 0 ? (
            Object.entries(summaryByType).map(([typeLabel, count]) => (
              <div
                key={typeLabel}
                className="rounded-md border border-gray-200 p-3"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {typeLabel}
                </p>
                <p className="text-lg font-semibold text-gray-800">{count}</p>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-gray-200 p-3 md:col-span-4">
              <p className="text-sm text-gray-500">
                Run a report to see event type totals.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-md p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Report Results
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Employee</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">End</th>
                <th className="py-2 pr-3">Holiday</th>
                <th className="py-2 pr-3">Details</th>
                <th className="py-2 pr-3">Display Text</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.length > 0 ? (
                reportRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 text-gray-700 align-top"
                  >
                    <td className="py-2 pr-3">{row.employee_name || "-"}</td>
                    <td className="py-2 pr-3">{row.event_type_label || "-"}</td>
                    <td className="py-2 pr-3">{row.start}</td>
                    <td className="py-2 pr-3">{row.end_date}</td>
                    <td className="py-2 pr-3">{row.is_holiday ? "Yes" : "No"}</td>
                    <td className="py-2 pr-3">{row.details || "-"}</td>
                    <td className="py-2 pr-3">{row.title || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 text-center text-gray-500" colSpan={7}>
                    No report data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

EventCalendarReport.propTypes = {
  isEmbedded: PropTypes.bool,
};
