import { useContext, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { AdminContext } from "../../../../../store/admin-context";
import { getStartOfMonth } from "../../../../../util/helper";
import { ExpensesContext } from "../../../../../store/expense-context";

export default function ManageExpensesTable() {
  let monthDate;

  if (localStorage.getItem("month_date") === null) {
    monthDate = getStartOfMonth(new Date());
  } else {
    monthDate = getStartOfMonth(new Date(localStorage.getItem("month_date")));
  }

  const [selectedDate, setSelectedDate] = useState(monthDate);
  const [expenses, setExpenses] = useState([]);
  const [signedCount, setSignedCount] = useState(0);

  const adminCtx = useContext(AdminContext);
  const expenseCtx = useContext(ExpensesContext);
  const [isToggled, setIsToggled] = useState(false);
  const expenseMode = !isToggled ? "Go To Open" : "Go To By Date";

  async function handleToggle() {
    const newState = !isToggled; // use current state
    setIsToggled(newState);

    const isoDate = new Date(selectedDate).toISOString();

    let res;
    if (newState) {
      // Going to Open Expenses
      res = await adminCtx.getOpenExpenses(selectedDate);
    } else {
      // Going back to Expenses By Date
      res = await adminCtx.getUsersExpensesByDate(isoDate);
    }

    const sorted = (res || []).sort((a, b) => {
      const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
      const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
      return lastNameA.localeCompare(lastNameB);
    });

    setExpenses(sorted || []);
    // const count = (sorted || []).filter((ts) => ts.paid === true).length;
    // setSignedCount(count);
  }

  function handleValueChange(index, field, value) {
    const userName = localStorage.getItem("user_name"); // Fetch user_name from localStorage

    setExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      const isChecked =
        value === "true" ? true : !updatedExpenses[index][field];

      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: isChecked, // Update the checkbox field
        ...(field === "signed" && isChecked && { submitted_by: userName }),
        ...(field === "approved" && isChecked && { approved_by: userName }),
        ...(field === "paid" && isChecked && { processed_by: userName }),
      };

      return updatedExpenses;
    });
  }

  const goToPreviousMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1); // Go back 1 month
      const monthDate = getStartOfMonth(newDate);
      localStorage.setItem("month_date", monthDate);
      return monthDate; // Ensure it is the start of the month
    });
  };
  const goToNextMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1); // Go forward 1 month
      const monthDate = getStartOfMonth(newDate);
      localStorage.setItem("month_date", monthDate);
      return monthDate; // Ensure it is the start of the month
    });
  };

  useEffect(() => {
    async function getExpenses() {
      const isoDate = new Date(selectedDate).toISOString();

      const res = await adminCtx.getUsersExpensesByDate(isoDate);

      const sorted = (res || []).sort((a, b) => {
        const lastNameA = a.Employee?.last_name?.toLowerCase() || "";
        const lastNameB = b.Employee?.last_name?.toLowerCase() || "";
        return lastNameA.localeCompare(lastNameB);
      });
      setExpenses(sorted || []);
      const count = (sorted || []).filter((ts) => ts.signed === true).length;
      setSignedCount(count);
    }
    getExpenses();
  }, [selectedDate]);

  async function handleSaveStatusChanges() {
    const res = await adminCtx.saveExpensesStatusChanges(expenses);
    if (res.internalStatus === "success") {
      expenseCtx.triggerUpdate();
    }
  }

  function handleSetAllApproved() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setExpenses((prevExpenses) => {
      const allApproved = prevExpenses.every((expense) => expense.approved);

      return prevExpenses.map((expense) => ({
        ...expense,
        approved: !allApproved, // Toggle the approved state
        approved_by: !allApproved ? userName : "", // Set approved_by only if approving
      }));
    });
  }

  function handleSetAllProcessed() {
    const userName = localStorage.getItem("user_name") || "Unknown User";

    setExpenses((prevExpenses) => {
      const allProcessed = prevExpenses.every((expense) => expense.paid);

      return prevExpenses.map((expense) => ({
        ...expense,
        paid: !allProcessed, // Toggle the processed state
        processed_by: !allProcessed ? userName : "", // Set processed_by only if processing
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

    const pad = (n) => String(n).padStart(2, "0");

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

    // --- Helper to normalize expense date ---
    function normalizeExpenseDate(dateStart, entryDay) {
      // Extract just the yyyy-mm-dd portion
      const [year, month, day] = dateStart.split("T")[0].split("-").map(Number);

      let baseYear = year;
      let baseMonth = month; // 1–12

      // If it's not already the 1st, bump to the next month
      if (day !== 1) {
        baseMonth += 1;
        if (baseMonth > 12) {
          baseMonth = 1;
          baseYear += 1;
        }
      }

      // Clamp entry.day to valid range
      const dayNumRaw = Number(entryDay);
      const daysInMonth = new Date(baseYear, baseMonth, 0).getDate();
      const clampedDay = Math.min(Math.max(dayNumRaw || 1, 1), daysInMonth);

      return `${baseYear}-${pad(baseMonth)}-${pad(clampedDay)}`;
    }

    // Step 1: Collect rows instead of appending directly
    const allRows = [];

    newExpenses.forEach((expenseWrapper) => {
      const expense = expenseWrapper.expense;
      const employee = expenseWrapper.employee;
      const entries = expenseWrapper.expenseEntries || [];

      entries.forEach((entry) => {
        const rowsToCreate = [];

        const expenseDate = normalizeExpenseDate(expense.date_start, entry.day);

        // Miscellaneous
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

        // Other cost-based types
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
            Type: withSGA(row.type, entry.sga_flag),
            TransportWhere: "",
            ProjectNumber: entry.project_number || "ProjOver",
            Purpose: expense.message || "",
            MiscDetail: row.miscDetail || "",
            MiscType: row.miscType || "",
            EntInfo: " ",
          });
        });
      });
    });

    // Step 2: Sort rows by date
    allRows.sort((a, b) => new Date(a.ExpenseDate) - new Date(b.ExpenseDate));

    // Step 3: Build XML after sorting
    let xmlContent = "<ProjectExpenses>\n";
    allRows.forEach((row) => {
      xmlContent += `<row ExpenseDate="${row.ExpenseDate}T00:00:00" EmployeeNumber="${row.EmployeeNumber}" EmployeeName="${row.EmployeeName}" Amount="${row.Amount}" Type="${row.Type}" TransportWhere="${row.TransportWhere}" ProjectNumber="${row.ProjectNumber}" Purpose="${row.Purpose}" MiscDetail="${row.MiscDetail}" MiscType="${row.MiscType}" EntInfo="${row.EntInfo}" />\n`;
      // xmlContent += `
      // <row
      //   ExpenseDate="${row.ExpenseDate}T00:00:00"
      //   EmployeeNumber="${row.EmployeeNumber}"
      //   EmployeeName="${row.EmployeeName}"
      //   Amount="${row.Amount}"
      //   Type="${row.Type}"
      //   TransportWhere="${row.TransportWhere}"
      //   ProjectNumber="${row.ProjectNumber}"
      //   Purpose="${row.Purpose}"
      //   MiscDetail="${row.MiscDetail}"
      //   MiscType="${row.MiscType}"
      //   EntInfo="${row.EntInfo}"
      // />\n`;
    });
    xmlContent += "</ProjectExpenses>";

    // Save file
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
      />
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
