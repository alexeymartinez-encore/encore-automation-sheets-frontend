import { useContext, useEffect, useMemo, useState } from "react";
import { AdminContext } from "../../../../store/admin-context";

function sumFields(entry, fields) {
  return fields.reduce(
    (total, key) => total + (parseFloat(entry[key]) || 0),
    0
  );
}

function parseDateUTC(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function addDaysUTC(dateObj, days) {
  if (!dateObj) return null;
  const d = new Date(dateObj);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function formatDate(date) {
  if (!date) return "";
  try {
    const parsed = addDaysUTC(parseDateUTC(date), 1); // shift to Sunday display
    if (!parsed) return date;
    const mm = parsed.getUTCMonth() + 1;
    const dd = parsed.getUTCDate();
    const yyyy = parsed.getUTCFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch (err) {
    return date;
  }
}

function toISODate(dateObj) {
  return dateObj.toISOString().split("T")[0];
}

function toMonthDayUTC(dateObj) {
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  return `${month}/${day}`;
}

function getWeekDates(weekEnding) {
  const sunday = addDaysUTC(parseDateUTC(weekEnding), 1); // shift to Sunday
  if (!sunday) return {};
  return {
    mon: toISODate(addDaysUTC(sunday, -6)),
    tue: toISODate(addDaysUTC(sunday, -5)),
    wed: toISODate(addDaysUTC(sunday, -4)),
    thu: toISODate(addDaysUTC(sunday, -3)),
    fri: toISODate(addDaysUTC(sunday, -2)),
    sat: toISODate(addDaysUTC(sunday, -1)),
    sun: toISODate(sunday),
  };
}

function dayUsageDetails(entry, weekEnding) {
  const dayMap = getWeekDates(weekEnding);
  const dayOrder = [
    ["mon", "Mon"],
    ["tue", "Tue"],
    ["wed", "Wed"],
    ["thu", "Thu"],
    ["fri", "Fri"],
    ["sat", "Sat"],
    ["sun", "Sun"],
  ];

  return dayOrder
    .map(([key, label]) => {
      const reg = parseFloat(entry[`${key}_reg`] || 0);
      const ot = parseFloat(entry[`${key}_ot`] || 0);
      if (!reg && !ot) return null;
      return `${label} ${dayMap[key] || ""}: reg ${reg || 0}, ot ${ot || 0}`;
    })
    .filter(Boolean);
}

function dayValues(entry, weekEnding) {
  const dayMap = getWeekDates(weekEnding);
  const dayOrder = [
    ["mon", "Mon"],
    ["tue", "Tue"],
    ["wed", "Wed"],
    ["thu", "Thu"],
    ["fri", "Fri"],
    ["sat", "Sat"],
    ["sun", "Sun"],
  ];

  return dayOrder.map(([key, label]) => {
    const reg = parseFloat(entry[`${key}_reg`] || 0);
    const ot = parseFloat(entry[`${key}_ot`] || 0);
    const dateLabel = dayMap[key]
      ? toMonthDayUTC(parseDateUTC(dayMap[key]))
      : "";
    return {
      key,
      label,
      dateLabel,
      reg,
      ot,
    };
  });
}

export default function CategoryEntriesReport() {
  const adminCtx = useContext(AdminContext);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
    employeeId: "",
    categoryId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  useEffect(() => {
    adminCtx.getAllEmployees().then((data) => {
      if (Array.isArray(data)) setEmployees(data);
    });

    adminCtx.getAllProjects().then((data) => {
      if (Array.isArray(data)) setProjects(data);
    });
  }, [adminCtx]);

  const employeeOptions = useMemo(
    () =>
      employees
        .map((emp) => ({
          label: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          value: emp.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [employees]
  );

  const filteredEmployeeOptions = useMemo(() => {
    if (!employeeSearch) return employeeOptions;
    const term = employeeSearch.toLowerCase();
    return employeeOptions.filter((emp) =>
      emp.label.toLowerCase().includes(term)
    );
  }, [employeeOptions, employeeSearch]);

  const projectOptions = useMemo(() => {
    return projects
      .map((proj) => ({
        label:
          proj.short_name ||
          proj.description ||
          proj.number ||
          `Project ${proj.id}`,
        value: proj.id,
        shortName: proj.short_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projects]);

  useEffect(() => {
    if (projectOptions.length > 0 && !filters.categoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryId: projectOptions[0].value,
        category: projectOptions[0].label,
      }));
    }
  }, [projectOptions, filters.categoryId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!filters.from || !filters.to) {
      setError("Please provide both start and end dates.");
      return;
    }

    if (!filters.categoryId) {
      setError("Please choose a category project.");
      return;
    }

    setIsLoading(true);
    const payload = {
      from: filters.from,
      to: filters.to,
      category: filters.category,
      employeeId: filters.employeeId || undefined,
      categoryId: filters.categoryId || undefined,
    };
    const data = await adminCtx.fetchCategoryEntriesData(payload);
    if (!data) {
      setError("Could not fetch report data. Please try again.");
      setResults([]);
    } else {
      setResults(data);
    }
    setIsLoading(false);
  }

  function handleExportCsv() {
    if (!results || results.length === 0) return;

    const headers = [
      "Employee",
      "Week Ending",
      "Project",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Reg Hours",
      "OT Hours",
    ];

    const rows = results.map((row) => {
      const regHours = sumFields(row.entry, [
        "mon_reg",
        "tue_reg",
        "wed_reg",
        "thu_reg",
        "fri_reg",
        "sat_reg",
        "sun_reg",
      ]);
      const otHours = sumFields(row.entry, [
        "mon_ot",
        "tue_ot",
        "wed_ot",
        "thu_ot",
        "fri_ot",
        "sat_ot",
        "sun_ot",
      ]);
      const days = dayValues(row.entry, row.timesheet?.week_ending);

      const projectName =
        row.project?.short_name ||
        row.project?.description ||
        row.project?.number ||
        "";

      return [
        row.employee
          ? `${row.employee.first_name || ""} ${
              row.employee.last_name || ""
            }`.trim()
          : "",
        row.timesheet?.week_ending || "",
        projectName,
        ...days.map((d) =>
          d.reg || d.ot ? `${d.dateLabel} Reg ${d.reg} / OT ${d.ot}` : ""
        ),
        regHours.toFixed(2),
        otHours.toFixed(2),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((r) =>
        r
          .map((cell = "") => {
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "category-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 my-5">
      <div className="bg-white shadow-sm rounded-md p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Category Report
          </h2>
          <p className="text-sm text-gray-500">
            Filter entries by date range, employee, and category.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">From date*</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
              className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">To date*</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
              className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Category (Project)</label>
            <select
              value={filters.categoryId}
              onChange={(e) => {
                const selected = projectOptions.find(
                  (opt) => String(opt.value) === e.target.value
                );
                setFilters((prev) => ({
                  ...prev,
                  categoryId: e.target.value,
                  category: selected?.label || prev.category,
                }));
              }}
              className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
            >
              <option value="">Select category project</option>
              {projectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {projectOptions.length === 0 ? "No projects found." : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Employee</label>
            <div className="relative">
              <div
                className="border rounded-md px-2 py-1.5 text-sm cursor-pointer bg-white flex justify-between items-center w-full"
                onClick={() => setEmployeeDropdownOpen((prev) => !prev)}
              >
                <span>
                  {filters.employeeId
                    ? employeeOptions.find(
                        (opt) =>
                          String(opt.value) === String(filters.employeeId)
                      )?.label
                    : "All employees"}
                </span>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
              {employeeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Type to filter"
                      className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, employeeId: "" }));
                      setEmployeeDropdownOpen(false);
                    }}
                  >
                    All employees
                  </div>
                  {filteredEmployeeOptions.map((emp) => (
                    <div
                      key={emp.value}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          employeeId: emp.value,
                        }));
                        setEmployeeDropdownOpen(false);
                      }}
                    >
                      {emp.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center justify-end md:col-span-5">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Run report"}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-md p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="text-md font-semibold text-gray-800">Results</h3>
          <p className="text-sm text-gray-500">
            {results.length} {results.length === 1 ? "entry" : "entries"} found
          </p>
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-xs transition-colors duration-200"
            disabled={results.length === 0}
          >
            Export CSV
          </button>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-500">Loading report data...</div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="text-sm text-gray-500">
            No data yet. Run a report above.
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Employee</th>
                  <th className="px-3 py-2 text-left font-medium">
                    Week Ending
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Project</th>
                  <th className="px-3 py-2 text-left font-medium">Mon</th>
                  <th className="px-3 py-2 text-left font-medium">Tue</th>
                  <th className="px-3 py-2 text-left font-medium">Wed</th>
                  <th className="px-3 py-2 text-left font-medium">Thu</th>
                  <th className="px-3 py-2 text-left font-medium">Fri</th>
                  <th className="px-3 py-2 text-left font-medium">Sat</th>
                  <th className="px-3 py-2 text-left font-medium">Sun</th>
                  <th className="px-3 py-2 text-left font-medium">Reg Hrs</th>
                  <th className="px-3 py-2 text-left font-medium">OT Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((row) => {
                  const regHours = sumFields(row.entry, [
                    "mon_reg",
                    "tue_reg",
                    "wed_reg",
                    "thu_reg",
                    "fri_reg",
                    "sat_reg",
                    "sun_reg",
                  ]);
                  const otHours = sumFields(row.entry, [
                    "mon_ot",
                    "tue_ot",
                    "wed_ot",
                    "thu_ot",
                    "fri_ot",
                    "sat_ot",
                    "sun_ot",
                  ]);
                  const days = dayValues(row.entry, row.timesheet?.week_ending);

                  return (
                    <tr key={row.entry.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {row.employee
                          ? `${row.employee.first_name || ""} ${
                              row.employee.last_name || ""
                            }`.trim()
                          : "N/A"}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(row.timesheet?.week_ending)}
                      </td>
                      <td className="px-3 py-2">
                        {row.project
                          ? row.project.short_name ||
                            row.project.description ||
                            row.project.number ||
                            "N/A"
                          : "N/A"}
                      </td>
                      {days.map((d) => (
                        <td
                          key={d.key}
                          className="px-3 py-2 whitespace-pre-line"
                        >
                          {d.reg || d.ot
                            ? `${d.label} (${d.dateLabel || "-"})\nReg ${
                                d.reg
                              } / OT ${d.ot}`
                            : "-"}
                        </td>
                      ))}
                      <td className="px-3 py-2">{regHours.toFixed(2)}</td>
                      <td className="px-3 py-2">{otHours.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
