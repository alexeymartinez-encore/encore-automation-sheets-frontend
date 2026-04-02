import PropTypes from "prop-types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDaysInMonth } from "date-fns";
import { AdminContext } from "../../../../../store/admin-context";

const DEFAULT_RECORD_TYPE = "timesheet";

function normalizeToLocalMidnight(value) {
  const candidate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(candidate.getTime())) return null;
  return new Date(
    candidate.getFullYear(),
    candidate.getMonth(),
    candidate.getDate(),
    0,
    0,
    0,
    0
  );
}

function normalizeToSunday(value) {
  const localDate = normalizeToLocalMidnight(value);
  if (!localDate) return null;

  const daysUntilSunday = (7 - localDate.getDay()) % 7;
  localDate.setDate(localDate.getDate() + daysUntilSunday);
  return localDate;
}

function normalizeToMonthStart(value) {
  const localDate = normalizeToLocalMidnight(value);
  if (!localDate) return null;
  return new Date(localDate.getFullYear(), localDate.getMonth(), 1, 0, 0, 0, 0);
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function AdminQuickCreateMenu({
  employees,
  isLoading,
  onCreated,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [recordType, setRecordType] = useState(DEFAULT_RECORD_TYPE);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedWeekDate, setSelectedWeekDate] = useState(() =>
    normalizeToSunday(new Date())
  );
  const [selectedMonthDate, setSelectedMonthDate] = useState(() =>
    normalizeToMonthStart(new Date())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminCtx = useContext(AdminContext);
  const containerRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const activeEmployees = useMemo(
    () => (employees || []).filter((employee) => employee?.is_active),
    [employees]
  );

  useEffect(() => {
    if (selectedEmployeeId || activeEmployees.length === 0) {
      return;
    }

    setSelectedEmployeeId(String(activeEmployees[0].id));
  }, [activeEmployees, selectedEmployeeId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedEmployee = activeEmployees.find(
    (employee) => String(employee.id) === selectedEmployeeId
  );

  const selectedDateForCreate =
    recordType === "timesheet" ? selectedWeekDate : selectedMonthDate;

  const isCreateDisabled =
    isLoading ||
    isSubmitting ||
    !selectedEmployeeId ||
    !selectedDateForCreate ||
    !selectedEmployee;

  async function createEmptyTimesheet(employeeId, weekDate) {
    const payload = {
      timesheetData: {
        employee_id: Number(employeeId),
        week_ending: weekDate,
        total_reg_hours: 0,
        total_overtime: 0,
        approved: false,
        signed: false,
        processed: false,
        approved_by: "None",
        processed_by: "None",
        submitted_by: "None",
        message: "None",
      },
      timesheetEntryData: [],
    };

    const response = await fetch(`${BASE_URL}/timesheets/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafely(response);
    if (!response.ok) {
      throw new Error(data?.message || "Could not create the timecard.");
    }

    return data;
  }

  async function createEmptyExpense(employeeId, monthDate) {
    const monthStart = normalizeToMonthStart(monthDate);
    if (!monthStart) {
      throw new Error("Invalid expense month selected.");
    }

    const expenseData = {
      approved: false,
      approved_by: "None",
      date_paid: null,
      employee_id: Number(employeeId),
      id: null,
      message: "None",
      paid: false,
      processed_by: "None",
      signed: false,
      submitted_by: "None",
      num_of_days: getDaysInMonth(monthStart),
      date_start: monthStart,
      total: 0,
    };

    const formData = new FormData();
    formData.append("expenseData", JSON.stringify(expenseData));
    formData.append("expenseEntriesData", JSON.stringify([]));

    const response = await fetch(`${BASE_URL}/expenses/save`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await parseJsonSafely(response);
    if (!response.ok) {
      throw new Error(data?.message || "Could not create the expense.");
    }

    return data;
  }

  async function handleCreateRecord(event) {
    event.preventDefault();
    if (isCreateDisabled) {
      return;
    }

    const localPrefillDate =
      recordType === "timesheet"
        ? normalizeToSunday(selectedWeekDate)
        : normalizeToMonthStart(selectedMonthDate);

    if (!localPrefillDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response =
        recordType === "timesheet"
          ? await createEmptyTimesheet(selectedEmployee.id, localPrefillDate)
          : await createEmptyExpense(selectedEmployee.id, localPrefillDate);

      if (response?.internalStatus === "success") {
        adminCtx.triggerSucessOrFailMessage(
          "success",
          response.message ||
            `${recordType === "timesheet" ? "Timecard" : "Expense"} created.`
        );
        onCreated?.();
        setIsOpen(false);
        return;
      }

      adminCtx.triggerSucessOrFailMessage(
        "fail",
        response?.message ||
          `Could not create ${recordType === "timesheet" ? "timecard" : "expense"}.`
      );
    } catch (error) {
      adminCtx.triggerSucessOrFailMessage(
        "fail",
        error.message ||
          `Could not create ${recordType === "timesheet" ? "timecard" : "expense"}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full md:w-auto md:ml-auto">
      <button
        type="button"
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-blue-500 bg-blue-500 px-4 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:text-sm"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        disabled={isLoading || isSubmitting}
        aria-expanded={isOpen}
        aria-controls="admin-create-dropdown"
      >
        + Create for Employee
      </button>

      {isOpen ? (
        <form
          id="admin-create-dropdown"
          onSubmit={handleCreateRecord}
          className="absolute right-0 z-50 mt-2 w-full rounded-md border border-slate-200 bg-white p-4 shadow-xl md:w-[22rem]"
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="admin-create-record-type"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Record Type
              </label>
              <select
                id="admin-create-record-type"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={recordType}
                  onChange={(event) => setRecordType(event.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="timesheet">Timecard</option>
                  <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-create-employee"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Employee
              </label>
              <select
                id="admin-create-employee"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                disabled={activeEmployees.length === 0 || isSubmitting}
              >
                {activeEmployees.length === 0 ? (
                  <option value="">No active employees found</option>
                ) : (
                  activeEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-create-date"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                {recordType === "timesheet" ? "Week Date" : "Month Date"}
              </label>
              {recordType === "timesheet" ? (
                <DatePicker
                  id="admin-create-date"
                  selected={selectedWeekDate}
                  onChange={(value) => {
                    const sundayDate = normalizeToSunday(value);
                    if (sundayDate) {
                      setSelectedWeekDate(sundayDate);
                    }
                  }}
                  filterDate={(date) => date.getDay() === 0}
                  dateFormat="EEE, MMM d, yyyy"
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              ) : (
                <DatePicker
                  id="admin-create-date"
                  selected={selectedMonthDate}
                  onChange={(value) => {
                    const monthDate = normalizeToMonthStart(value);
                    if (monthDate) {
                      setSelectedMonthDate(monthDate);
                    }
                  }}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 md:text-sm"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md border border-blue-500 bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
                disabled={isCreateDisabled}
              >
                {isSubmitting
                  ? "Creating..."
                  : `Create Empty ${
                      recordType === "timesheet" ? "Timecard" : "Expense"
                    }`}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

AdminQuickCreateMenu.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      is_active: PropTypes.bool,
    })
  ),
  isLoading: PropTypes.bool,
  onCreated: PropTypes.func,
};
