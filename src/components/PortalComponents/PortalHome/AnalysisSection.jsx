import { useContext, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MiscellaneousContext } from "../../../store/miscellaneous-context";
import { fetchUser } from "../../../util/fetching";

const REG_FIELDS = [
  "mon_reg",
  "tue_reg",
  "wed_reg",
  "thu_reg",
  "fri_reg",
  "sat_reg",
  "sun_reg",
];

const OT_FIELDS = [
  "mon_ot",
  "tue_ot",
  "wed_ot",
  "thu_ot",
  "fri_ot",
  "sat_ot",
  "sun_ot",
];

const DAY_KEYS = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
  ["sun", "Sun"],
];

function toIsoDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: toIsoDateLocal(monthStart),
    to: toIsoDateLocal(today),
  };
}

function sumFields(entry, fields) {
  return fields.reduce(
    (sum, field) => sum + (parseFloat(entry?.[field]) || 0),
    0
  );
}

function getDailyValues(entry) {
  return DAY_KEYS.map(([dayKey, dayLabel]) => ({
    key: dayKey,
    label: dayLabel,
    reg: parseFloat(entry?.[`${dayKey}_reg`] || 0),
    ot: parseFloat(entry?.[`${dayKey}_ot`] || 0),
  }));
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const parsed = new Date(`${String(dateValue).split("T")[0]}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatProjectLabel(project) {
  if (!project) return "Unknown";
  return (
    project.short_name ||
    project.description ||
    project.number ||
    `Project ${project.id}`
  );
}

function formatPhaseLabel(phase) {
  if (!phase) return "Unknown";
  if (phase.number && phase.description) {
    return `${phase.number} - ${phase.description}`;
  }
  return phase.number || phase.description || `Phase ${phase.id}`;
}

function formatCostCodeLabel(costCode) {
  if (!costCode) return "Unknown";
  if (costCode.cost_code && costCode.description) {
    return `${costCode.cost_code} - ${costCode.description}`;
  }
  return costCode.cost_code || costCode.description || `Cost Code ${costCode.id}`;
}

function getExpenseRowTotal(entry) {
  const fields = [
    "destination_cost",
    "lodging_cost",
    "other_expense_cost",
    "car_rental_cost",
    "miles_cost",
    "perdiem_cost",
    "entertainment_cost",
    "miscellaneous_amount",
  ];

  return fields.reduce((sum, field) => sum + (parseFloat(entry?.[field]) || 0), 0);
}

function createExportSuffix() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}`;
}

function downloadCsvFile(fileName, headers, rows) {
  const csvLines = [headers, ...rows].map((row) =>
    row
      .map((cell = "") => {
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AnalysisSection() {
  const user = fetchUser();
  const { projects, phases, costCodes } = useContext(MiscellaneousContext);
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  const defaultDates = getDefaultDateRange();

  const [activeReport, setActiveReport] = useState("timecards");
  const [timecardFilters, setTimecardFilters] = useState({
    from: defaultDates.from,
    to: defaultDates.to,
    projectId: "",
    phaseId: "",
    costCodeId: "",
  });
  const [expenseFilters, setExpenseFilters] = useState({
    from: defaultDates.from,
    to: defaultDates.to,
    jobId: "",
  });
  const [timecardResults, setTimecardResults] = useState([]);
  const [expenseResults, setExpenseResults] = useState([]);
  const [timecardError, setTimecardError] = useState("");
  const [expenseError, setExpenseError] = useState("");
  const [timecardLoading, setTimecardLoading] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);

  const projectOptions = useMemo(() => {
    return [...(projects || [])].sort((a, b) =>
      formatProjectLabel(a).localeCompare(formatProjectLabel(b))
    );
  }, [projects]);

  const phaseOptions = useMemo(() => {
    return [...(phases || [])].sort((a, b) =>
      formatPhaseLabel(a).localeCompare(formatPhaseLabel(b))
    );
  }, [phases]);

  const costCodeOptions = useMemo(() => {
    return [...(costCodes || [])].sort((a, b) =>
      formatCostCodeLabel(a).localeCompare(formatCostCodeLabel(b))
    );
  }, [costCodes]);

  const timecardExportRows = useMemo(() => {
    return timecardResults.map((row) => {
      const regHours = sumFields(row.entry, REG_FIELDS);
      const otHours = sumFields(row.entry, OT_FIELDS);
      const totalHours = regHours + otHours;
      const dayValues = getDailyValues(row.entry);

      return [
        formatDate(row.timesheet?.week_ending),
        formatProjectLabel(row.project),
        formatPhaseLabel(row.phase),
        formatCostCodeLabel(row.cost_code),
        ...dayValues.map((day) => (day.reg || day.ot ? `R ${day.reg} / OT ${day.ot}` : "-")),
        regHours.toFixed(2),
        otHours.toFixed(2),
        totalHours.toFixed(2),
      ];
    });
  }, [timecardResults]);

  const expenseExportRows = useMemo(() => {
    return expenseResults.map((row) => {
      const rowTotal = row.entry?.row_total ?? getExpenseRowTotal(row.entry);
      return [
        formatDate(row.expense?.date_start),
        row.entry?.day ?? "-",
        formatProjectLabel(row.project),
        row.entry?.purpose || "-",
        row.entry?.destination_name || "-",
        Number(rowTotal).toFixed(2),
        row.expense?.signed ? "Yes" : "No",
        row.expense?.approved ? "Yes" : "No",
        row.expense?.paid ? "Yes" : "No",
      ];
    });
  }, [expenseResults]);

  function exportTimecardsCsv() {
    if (timecardExportRows.length === 0) return;

    const headers = [
      "Week Ending",
      "Job",
      "Phase",
      "Cost Code",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Reg Hours",
      "OT Hours",
      "Total Hours",
    ];

    downloadCsvFile(
      `personal-timecard-analysis-${createExportSuffix()}.csv`,
      headers,
      timecardExportRows
    );
  }

  function exportTimecardsPdf() {
    if (timecardExportRows.length === 0) return;

    const headers = [
      "Week Ending",
      "Job",
      "Phase",
      "Cost Code",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Reg",
      "OT",
      "Total",
    ];

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter",
    });

    doc.setFontSize(13);
    doc.text("Personal Timecard Analysis", 30, 32);
    doc.setFontSize(9);
    doc.text(
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
      30,
      46
    );
    doc.text(
      `Range: ${timecardFilters.from || "-"} to ${timecardFilters.to || "-"}`,
      30,
      58
    );

    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: timecardExportRows,
      theme: "striped",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [59, 130, 246],
      },
      margin: { left: 20, right: 20 },
    });

    doc.save(`personal-timecard-analysis-${createExportSuffix()}.pdf`);
  }

  function exportExpensesCsv() {
    if (expenseExportRows.length === 0) return;

    const headers = [
      "Date",
      "Day",
      "Job",
      "Purpose",
      "Destination",
      "Entry Total",
      "Signed",
      "Approved",
      "Paid",
    ];

    downloadCsvFile(
      `personal-expense-analysis-${createExportSuffix()}.csv`,
      headers,
      expenseExportRows
    );
  }

  function exportExpensesPdf() {
    if (expenseExportRows.length === 0) return;

    const headers = [
      "Date",
      "Day",
      "Job",
      "Purpose",
      "Destination",
      "Entry Total",
      "Signed",
      "Approved",
      "Paid",
    ];

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter",
    });

    doc.setFontSize(13);
    doc.text("Personal Expense Analysis", 30, 32);
    doc.setFontSize(9);
    doc.text(
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
      30,
      46
    );
    doc.text(
      `Range: ${expenseFilters.from || "-"} to ${expenseFilters.to || "-"}`,
      30,
      58
    );

    autoTable(doc, {
      startY: 70,
      head: [headers],
      body: expenseExportRows,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [59, 130, 246],
      },
      margin: { left: 20, right: 20 },
    });

    doc.save(`personal-expense-analysis-${createExportSuffix()}.pdf`);
  }

  async function runTimecardAnalysis(e) {
    e.preventDefault();
    setTimecardError("");
    setTimecardLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/reports/timecards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          from: timecardFilters.from,
          to: timecardFilters.to,
          projectId: timecardFilters.projectId || undefined,
          phaseId: timecardFilters.phaseId || undefined,
          costCodeId: timecardFilters.costCodeId || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.internalStatus === "fail") {
        throw new Error(data.message || "Could not run timecard analysis.");
      }

      setTimecardResults(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setTimecardResults([]);
      setTimecardError(error.message || "Could not run timecard analysis.");
    } finally {
      setTimecardLoading(false);
    }
  }

  async function runExpenseAnalysis(e) {
    e.preventDefault();
    setExpenseError("");
    setExpenseLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/reports/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          from: expenseFilters.from,
          to: expenseFilters.to,
          projectId: expenseFilters.jobId || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.internalStatus === "fail") {
        throw new Error(data.message || "Could not run expense analysis.");
      }

      setExpenseResults(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setExpenseResults([]);
      setExpenseError(error.message || "Could not run expense analysis.");
    } finally {
      setExpenseLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-xs rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl text-blue-500">Personal Analysis</h1>
        <p className="text-xs text-gray-500">
          {user?.first_name || ""} {user?.last_name || ""}
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setActiveReport("timecards")}
          className={`px-3 py-1.5 rounded-md text-xs md:text-sm ${
            activeReport === "timecards"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Timecards
        </button>
        <button
          type="button"
          onClick={() => setActiveReport("expenses")}
          className={`px-3 py-1.5 rounded-md text-xs md:text-sm ${
            activeReport === "expenses"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Expense Reports
        </button>
      </div>

      {activeReport === "timecards" && (
        <>
          <form
            onSubmit={runTimecardAnalysis}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">From</label>
              <input
                type="date"
                value={timecardFilters.from}
                onChange={(e) =>
                  setTimecardFilters((prev) => ({ ...prev, from: e.target.value }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">To</label>
              <input
                type="date"
                value={timecardFilters.to}
                onChange={(e) =>
                  setTimecardFilters((prev) => ({ ...prev, to: e.target.value }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Job</label>
              <select
                value={timecardFilters.projectId}
                onChange={(e) =>
                  setTimecardFilters((prev) => ({
                    ...prev,
                    projectId: e.target.value,
                  }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All jobs</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {formatProjectLabel(project)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Phase Code</label>
              <select
                value={timecardFilters.phaseId}
                onChange={(e) =>
                  setTimecardFilters((prev) => ({
                    ...prev,
                    phaseId: e.target.value,
                  }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All phase codes</option>
                {phaseOptions.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {formatPhaseLabel(phase)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Cost Code</label>
              <select
                value={timecardFilters.costCodeId}
                onChange={(e) =>
                  setTimecardFilters((prev) => ({
                    ...prev,
                    costCodeId: e.target.value,
                  }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All cost codes</option>
                {costCodeOptions.map((costCode) => (
                  <option key={costCode.id} value={costCode.id}>
                    {formatCostCodeLabel(costCode)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-70"
                disabled={timecardLoading}
              >
                {timecardLoading ? "Running..." : "Run Analysis"}
              </button>
            </div>
          </form>

          {timecardError && (
            <p className="text-xs text-red-600 mt-2">{timecardError}</p>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-700">
                Timecard Results
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500">
                  {timecardResults.length}{" "}
                  {timecardResults.length === 1 ? "entry" : "entries"}
                </p>
                <button
                  type="button"
                  onClick={exportTimecardsCsv}
                  disabled={timecardResults.length === 0}
                  className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-md text-xs disabled:opacity-60"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportTimecardsPdf}
                  disabled={timecardResults.length === 0}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-md text-xs disabled:opacity-60"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {!timecardLoading && timecardResults.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Run the analysis to view your timecard entries.
              </p>
            )}

            {timecardResults.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">
                        Week Ending
                      </th>
                      <th className="px-2 py-2 text-left font-medium">Job</th>
                      <th className="px-2 py-2 text-left font-medium">Phase</th>
                      <th className="px-2 py-2 text-left font-medium">Cost</th>
                      <th className="px-2 py-2 text-left font-medium">Mon</th>
                      <th className="px-2 py-2 text-left font-medium">Tue</th>
                      <th className="px-2 py-2 text-left font-medium">Wed</th>
                      <th className="px-2 py-2 text-left font-medium">Thu</th>
                      <th className="px-2 py-2 text-left font-medium">Fri</th>
                      <th className="px-2 py-2 text-left font-medium">Sat</th>
                      <th className="px-2 py-2 text-left font-medium">Sun</th>
                      <th className="px-2 py-2 text-left font-medium">Reg</th>
                      <th className="px-2 py-2 text-left font-medium">OT</th>
                      <th className="px-2 py-2 text-left font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timecardResults.map((row) => {
                      const regHours = sumFields(row.entry, REG_FIELDS);
                      const otHours = sumFields(row.entry, OT_FIELDS);
                      const totalHours = regHours + otHours;
                      const dayValues = getDailyValues(row.entry);

                      return (
                        <tr key={row.entry.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2">
                            {formatDate(row.timesheet?.week_ending)}
                          </td>
                          <td className="px-2 py-2">
                            {formatProjectLabel(row.project)}
                          </td>
                          <td className="px-2 py-2">
                            {formatPhaseLabel(row.phase)}
                          </td>
                          <td className="px-2 py-2">
                            {formatCostCodeLabel(row.cost_code)}
                          </td>
                          {dayValues.map((day) => (
                            <td key={day.key} className="px-2 py-2">
                              {day.reg || day.ot
                                ? `R ${day.reg} / OT ${day.ot}`
                                : "-"}
                            </td>
                          ))}
                          <td className="px-2 py-2">{regHours.toFixed(2)}</td>
                          <td className="px-2 py-2">{otHours.toFixed(2)}</td>
                          <td className="px-2 py-2">{totalHours.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeReport === "expenses" && (
        <>
          <form
            onSubmit={runExpenseAnalysis}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">From</label>
              <input
                type="date"
                value={expenseFilters.from}
                onChange={(e) =>
                  setExpenseFilters((prev) => ({ ...prev, from: e.target.value }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">To</label>
              <input
                type="date"
                value={expenseFilters.to}
                onChange={(e) =>
                  setExpenseFilters((prev) => ({ ...prev, to: e.target.value }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Job</label>
              <select
                value={expenseFilters.jobId}
                onChange={(e) =>
                  setExpenseFilters((prev) => ({ ...prev, jobId: e.target.value }))
                }
                className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All jobs</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {formatProjectLabel(project)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-70"
                disabled={expenseLoading}
              >
                {expenseLoading ? "Running..." : "Run Analysis"}
              </button>
            </div>
          </form>

          {expenseError && <p className="text-xs text-red-600 mt-2">{expenseError}</p>}

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-700">
                Expense Results
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-500">
                  {expenseResults.length}{" "}
                  {expenseResults.length === 1 ? "entry" : "entries"}
                </p>
                <button
                  type="button"
                  onClick={exportExpensesCsv}
                  disabled={expenseResults.length === 0}
                  className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-md text-xs disabled:opacity-60"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportExpensesPdf}
                  disabled={expenseResults.length === 0}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-md text-xs disabled:opacity-60"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {!expenseLoading && expenseResults.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Run the analysis to view your expense entries.
              </p>
            )}

            {expenseResults.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Date</th>
                      <th className="px-2 py-2 text-left font-medium">Day</th>
                      <th className="px-2 py-2 text-left font-medium">Job</th>
                      <th className="px-2 py-2 text-left font-medium">
                        Purpose
                      </th>
                      <th className="px-2 py-2 text-left font-medium">
                        Destination
                      </th>
                      <th className="px-2 py-2 text-left font-medium">
                        Entry Total
                      </th>
                      <th className="px-2 py-2 text-left font-medium">Signed</th>
                      <th className="px-2 py-2 text-left font-medium">
                        Approved
                      </th>
                      <th className="px-2 py-2 text-left font-medium">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenseResults.map((row) => {
                      const rowTotal = row.entry?.row_total ?? getExpenseRowTotal(row.entry);
                      return (
                        <tr key={row.entry.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2">
                            {formatDate(row.expense?.date_start)}
                          </td>
                          <td className="px-2 py-2">{row.entry?.day ?? "-"}</td>
                          <td className="px-2 py-2">
                            {formatProjectLabel(row.project)}
                          </td>
                          <td className="px-2 py-2">{row.entry?.purpose || "-"}</td>
                          <td className="px-2 py-2">
                            {row.entry?.destination_name || "-"}
                          </td>
                          <td className="px-2 py-2">{formatCurrency(rowTotal)}</td>
                          <td className="px-2 py-2">
                            {row.expense?.signed ? "Yes" : "No"}
                          </td>
                          <td className="px-2 py-2">
                            {row.expense?.approved ? "Yes" : "No"}
                          </td>
                          <td className="px-2 py-2">
                            {row.expense?.paid ? "Yes" : "No"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
