import { useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { AdminContext } from "../../../../../store/admin-context";
import { getStartOfMonth } from "../../../../../util/helper";
import { ExpensesContext } from "../../../../../store/expense-context";
import MissingSubmissionPanel from "../ManageSheetsShared/MissingSubmissionPanel";

function buildMonthIsoDate(date) {
  return new Date(date).toISOString();
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function ManageExpensesTable({
  activeEmployeeCount = 0,
  refreshToken = 0,
}) {
  let monthDate;

  if (localStorage.getItem("month_date") === null) {
    monthDate = getStartOfMonth(new Date());
  } else {
    monthDate = getStartOfMonth(new Date(localStorage.getItem("month_date")));
  }

  const [selectedDate, setSelectedDate] = useState(monthDate);
  const [expenses, setExpenses] = useState([]);
  const [signedCount, setSignedCount] = useState(0);
  const [isToggled, setIsToggled] = useState(false);
  const [isMissingPanelOpen, setIsMissingPanelOpen] = useState(false);
  const [isMissingLoading, setIsMissingLoading] = useState(false);
  const [isSendingAllReminders, setIsSendingAllReminders] = useState(false);
  const [sendingReminderIds, setSendingReminderIds] = useState([]);
  const [missingSummary, setMissingSummary] = useState({
    missingEmployees: [],
    activeEmployeeCount,
    completedCount: 0,
  });

  const adminCtx = useContext(AdminContext);
  const expenseCtx = useContext(ExpensesContext);
  const expenseMode = !isToggled ? "Go To Open" : "Go To By Date";

  function handleToggle() {
    setIsToggled((previousValue) => {
      const nextValue = !previousValue;
      if (nextValue) {
        setIsMissingPanelOpen(false);
      }
      return nextValue;
    });
  }

  const loadMissingSummary = useCallback(async () => {
    if (isToggled) return;

    setIsMissingLoading(true);
    const summary = await adminCtx.getMissingExpensesByDate(
      buildMonthIsoDate(selectedDate)
    );
    setMissingSummary({
      missingEmployees: summary?.missingEmployees || [],
      activeEmployeeCount:
        summary?.activeEmployeeCount ?? activeEmployeeCount ?? 0,
      completedCount: summary?.completedCount || 0,
    });
    setIsMissingLoading(false);
  }, [activeEmployeeCount, adminCtx, isToggled, selectedDate]);

  async function handleToggleMissingPanel() {
    const nextOpen = !isMissingPanelOpen;
    setIsMissingPanelOpen(nextOpen);

    if (nextOpen) {
      await loadMissingSummary();
    }
  }

  function handleValueChange(index, field, value) {
    const userName = localStorage.getItem("user_name");

    setExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      const isChecked =
        value === "true" ? true : !updatedExpenses[index][field];

      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: isChecked,
        ...(field === "signed" && isChecked && { submitted_by: userName }),
        ...(field === "approved" && isChecked && { approved_by: userName }),
        ...(field === "paid" && isChecked && { processed_by: userName }),
      };

      return updatedExpenses;
    });
  }

  function goToPreviousMonth() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      const nextMonthDate = getStartOfMonth(newDate);
      localStorage.setItem("month_date", nextMonthDate);
      return nextMonthDate;
    });
  }

  function goToNextMonth() {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      const nextMonthDate = getStartOfMonth(newDate);
      localStorage.setItem("month_date", nextMonthDate);
      return nextMonthDate;
    });
  }

  const loadExpenses = useCallback(async () => {
    const isoDate = buildMonthIsoDate(selectedDate);
    const result = isToggled
      ? await adminCtx.getOpenExpenses(selectedDate)
      : await adminCtx.getUsersExpensesByDate(isoDate);

    const sorted = (result || []).sort((a, b) => {
      const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
      const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
      return lastNameA.localeCompare(lastNameB);
    });

    setExpenses(sorted || []);
    const count = (sorted || []).filter((expense) => expense.signed).length;
    setSignedCount(count);
  }, [adminCtx, isToggled, selectedDate]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshToken]);

  useEffect(() => {
    if (isMissingPanelOpen && !isToggled) {
      loadMissingSummary();
    }
  }, [isMissingPanelOpen, isToggled, loadMissingSummary]);

  async function handleSaveStatusChanges() {
    const res = await adminCtx.saveExpensesStatusChanges(expenses);
    if (res.internalStatus === "success") {
      expenseCtx.triggerUpdate();
    }
  }

  async function handleSendReminder(employeeId) {
    setSendingReminderIds((currentIds) =>
      currentIds.includes(employeeId) ? currentIds : [...currentIds, employeeId]
    );

    await adminCtx.sendMissingExpenseReminders({
      dateStart: buildMonthIsoDate(selectedDate),
      employeeIds: [employeeId],
    });

    setSendingReminderIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== employeeId)
    );
    await loadMissingSummary();
  }

  async function handleSendAllReminders() {
    setIsSendingAllReminders(true);
    await adminCtx.sendMissingExpenseReminders({
      dateStart: buildMonthIsoDate(selectedDate),
    });
    setIsSendingAllReminders(false);
    await loadMissingSummary();
  }

  function handleSetAllApproved() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setExpenses((prevExpenses) => {
      const allApproved = prevExpenses.every((expense) => expense.approved);

      return prevExpenses.map((expense) => ({
        ...expense,
        approved: !allApproved,
        approved_by: !allApproved ? userName : "",
      }));
    });
  }

  function handleSetAllProcessed() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setExpenses((prevExpenses) => {
      const allProcessed = prevExpenses.every((expense) => expense.paid);

      return prevExpenses.map((expense) => ({
        ...expense,
        paid: !allProcessed,
        processed_by: !allProcessed ? userName : "",
      }));
    });
  }

  async function generateExpenseReport() {
    let newExpenses;
    if (expenseMode === "Go To By Date") {
      newExpenses = await adminCtx.fetchOpenExpenseReportData(selectedDate);
    } else {
      newExpenses = await adminCtx.fetchExpenseReportData(selectedDate);
    }

    const pad = (value) => String(value).padStart(2, "0");

    const formatMonthYear = (date) =>
      date.toLocaleString("default", { month: "long" }) +
      " " +
      date.getFullYear();

    const fileName = `EncoreExpenses ${formatMonthYear(selectedDate)}.xml`;

    const miscTypeMapping = {
      Nothing: "Nothing",
      Meals: "Meals",
      "Postage/Freight/Shipping": "PostFrtShip",
      "Cell Phone": "CellPhn",
      "Employee Education / Training": "EmpEducTrain",
      "Supplies / Part": "SupplsPrts",
      "Employee Relations": "EmplyRelat",
    };

    const withSGA = (baseType, flag) =>
      flag === true || flag === 1 || flag === "1" ? `${baseType}SGA` : baseType;

    const normalizeReportType = (type) =>
      (
        {
          Bereavement: "Bereavem",
          EmpRelat: "EmplyRelat",
          EmpRelatSGA: "EmplyRelatSGA",
          EmpRel: "EmplyRelat",
        }
      )[type] || type;

    function normalizeExpenseDate(dateStart, entryDay) {
      const [year, month, day] = dateStart.split("T")[0].split("-").map(Number);

      let baseYear = year;
      let baseMonth = month;

      if (day !== 1) {
        baseMonth += 1;
        if (baseMonth > 12) {
          baseMonth = 1;
          baseYear += 1;
        }
      }

      const dayNumRaw = Number(entryDay);
      const daysInMonth = new Date(baseYear, baseMonth, 0).getDate();
      const clampedDay = Math.min(Math.max(dayNumRaw || 1, 1), daysInMonth);

      return `${baseYear}-${pad(baseMonth)}-${pad(clampedDay)}`;
    }

    const allRows = [];

    newExpenses.forEach((expenseWrapper) => {
      const expense = expenseWrapper.expense;
      const employee = expenseWrapper.employee;
      const entries = expenseWrapper.expenseEntries || [];

      entries.forEach((entry) => {
        const rowsToCreate = [];
        const expenseDate = normalizeExpenseDate(expense.date_start, entry.day);

        if (entry.miscellaneous_amount && entry.miscellaneous_amount !== 0) {
          const miscDesc = entry.miscellaneous_description || "Nothing";
          const mappedType = miscTypeMapping[miscDesc] || "Nothing";
          rowsToCreate.push({
            type: mappedType,
            amount: entry.miscellaneous_amount,
            miscDetail: miscDesc,
            miscType: miscDesc,
          });
        }

        if (entry.miles_cost && entry.miles_cost > 0) {
          rowsToCreate.push({ type: "Mileage", amount: entry.miles_cost });
        }
        if (entry.perdiem_cost && entry.perdiem_cost > 0) {
          rowsToCreate.push({ type: "PerDiem", amount: entry.perdiem_cost });
        }
        if (entry.car_rental_cost && entry.car_rental_cost > 0) {
          rowsToCreate.push({
            type: "CarRental",
            amount: entry.car_rental_cost,
          });
        }
        if (entry.other_expense_cost && entry.other_expense_cost > 0) {
          rowsToCreate.push({
            type: "CabsParking",
            amount: entry.other_expense_cost,
          });
        }
        if (entry.lodging_cost && entry.lodging_cost > 0) {
          rowsToCreate.push({ type: "Lodging", amount: entry.lodging_cost });
        }
        if (entry.destination_cost && entry.destination_cost > 0) {
          rowsToCreate.push({
            type: "Transportation",
            amount: entry.destination_cost,
          });
        }
        if (
          entry.entertainment_cost !== null &&
          entry.entertainment_cost !== 0
        ) {
          rowsToCreate.push({
            type: "Entertainment",
            amount: entry.entertainment_cost,
          });
        }

        rowsToCreate.forEach((row) => {
          allRows.push({
            ExpenseDate: expenseDate,
            EmployeeNumber: employee?.employee_number || "",
            EmployeeName: `${employee?.first_name || ""} ${
              employee?.last_name || ""
            }`,
            Amount: Number(row.amount).toFixed(4),
            Type: normalizeReportType(withSGA(row.type, entry.sga_flag)),
            TransportWhere: "",
            ProjectNumber: entry.project_number || "ProjOver",
            Purpose: entry.purpose || "",
            MiscDetail: row.miscDetail || "",
            MiscType: row.miscType || "",
            EntInfo: " ",
          });
        });
      });
    });

    allRows.sort((first, second) => new Date(first.ExpenseDate) - new Date(second.ExpenseDate));

    let xmlContent = "<ProjectExpenses>\n";
    allRows.forEach((row) => {
      xmlContent += `<row ExpenseDate="${row.ExpenseDate}T00:00:00" EmployeeNumber="${row.EmployeeNumber}" EmployeeName="${row.EmployeeName}" Amount="${row.Amount}" Type="${row.Type}" TransportWhere="${row.TransportWhere}" ProjectNumber="${row.ProjectNumber}" Purpose="${row.Purpose}" MiscDetail="${row.MiscDetail}" MiscType="${row.MiscType}" EntInfo="${row.EntInfo}" />\n`;
    });
    xmlContent += "</ProjectExpenses>";

    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col w-full ">
      <TaskBar
        onChange={(date) => setSelectedDate(date)}
        selectedDate={selectedDate}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        saveChanges={handleSaveStatusChanges}
        setAllApproved={handleSetAllApproved}
        setAllPaid={handleSetAllProcessed}
        generateReport={generateExpenseReport}
        isToggled={isToggled}
        handleToggle={handleToggle}
        expenseMode={expenseMode}
        completeExpenses={signedCount}
        totalEmployeesCount={activeEmployeeCount}
        toggleMissingPanel={handleToggleMissingPanel}
        isMissingPanelOpen={isMissingPanelOpen}
        missingButtonDisabled={isToggled}
      />

      {isMissingPanelOpen ? (
        <div className="my-2">
          <MissingSubmissionPanel
            title="Missing Expense Sheets"
            periodLabel={formatMonthLabel(selectedDate)}
            missingEmployees={missingSummary.missingEmployees}
            activeEmployeeCount={
              missingSummary.activeEmployeeCount || activeEmployeeCount || 0
            }
            completedCount={missingSummary.completedCount}
            isLoading={isMissingLoading}
            isSendingAll={isSendingAllReminders}
            sendingEmployeeIds={sendingReminderIds}
            onRefresh={loadMissingSummary}
            onSendAll={handleSendAllReminders}
            onSendSingle={handleSendReminder}
            emptyMessage="Everyone active has submitted a signed expense sheet for this month."
          />
        </div>
      ) : null}

      <TableHeader />
      <div className="bg-white my-1 rounded-md shadow-sm">
        {expenses && expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <TableRow
              key={expense.id}
              expense={expense}
              index={index}
              onValueChange={handleValueChange}
            />
          ))
        ) : (
          <p className="bg-white text-blue-900 text-center py-3 text-xs">
            No expenses open
          </p>
        )}
      </div>
    </div>
  );
}

ManageExpensesTable.propTypes = {
  activeEmployeeCount: PropTypes.number,
  refreshToken: PropTypes.number,
};
