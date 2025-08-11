import { useContext, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { AdminContext } from "../../../../../store/admin-context";
import { getStartOfMonth } from "../../../../../util/helper";
import { ExpensesContext } from "../../../../../store/expense-context";

export default function ManageExpensesTable() {
  const [selectedDate, setSelectedDate] = useState(getStartOfMonth(new Date()));
  const [expenses, setExpenses] = useState([]);

  const adminCtx = useContext(AdminContext);
  const expenseCtx = useContext(ExpensesContext);

  const [isToggled, setIsToggled] = useState(false);
  const expenseMode = !isToggled ? "Open Expenses" : "Expenses By Date";

  // const isSunday = (date) => date.getDay() === 0;
  async function handleToggle() {
    setIsToggled((prevState) => {
      const newState = !prevState;
      const isoDate = new Date(selectedDate).toISOString();

      if (newState) {
        // Going to Open Expenses
        adminCtx.getOpenExpenses().then((res) => setExpenses(res || []));
      } else {
        // Going back to Expenses By Date
        adminCtx
          .getUsersExpensesByDate(isoDate)
          .then((res) => setExpenses(res || []));
      }

      return newState;
    });
  }

  console.log(expenses);

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

  // Functions to handle month navigation
  const goToPreviousMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1); // Go back 1 month
      return getStartOfMonth(newDate); // Ensure it is the start of the month
    });
  };
  const goToNextMonth = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1); // Go forward 1 month
      return getStartOfMonth(newDate); // Ensure it is the start of the month
    });
  };

  useEffect(() => {
    async function getExpenses() {
      console.log("=========EXPENSES REGULAR DATE===========");
      console.log(selectedDate);
      const isoDate = new Date(selectedDate).toISOString();
      console.log("=========EXPENSES ISO DATE===========");
      console.log(isoDate); // 2025-08-11T00:59:42.000Z (UTC time)
      const res = await adminCtx.getUsersExpensesByDate(isoDate);
      setExpenses(res || []);
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

  // console.log("SELECTED DATE: ", selectedDate);

  async function generateExpenseReport() {
    const newExpenses = await adminCtx.fetchExpenseReportData(selectedDate);

    let xmlContent = "<ProjectExpenses>\n";

    const formatMonthYear = (date) => {
      return (
        date.toLocaleString("default", { month: "long" }) + date.getFullYear()
      );
    };

    const fileName = `EncoreExpenses${formatMonthYear(selectedDate)}.xml`;

    const miscTypeMapping = {
      Nothing: "Nothing",
      Meals: "Meals",
      "Postage/Freight/Shipping": "PostFrtShip",
      "Cell Phone": "CellPhn",
      "Employee Education / Training": "EmplEd",
      "Supplies / Part": "SupplsPrts",
      "Employee Relations": "EmpRel",
    };

    newExpenses.forEach((expenseWrapper) => {
      const expense = expenseWrapper.expense;
      const employee = expenseWrapper.employee;
      const entries = expenseWrapper.expenseEntries || [];
      console.log(expense.date_start);
      const currentDate = new Date(expense.date_start);
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      const expenseDate = nextMonth.toISOString().split("T")[0];

      entries.forEach((entry) => {
        const rowsToCreate = [];

        // 1. Miscellaneous entries
        if (entry.miscellaneous_amount && entry.miscellaneous_amount > 0) {
          const miscDesc = entry.miscellaneous_description || "Nothing";
          const mappedType = miscTypeMapping[miscDesc] || "Nothing";
          rowsToCreate.push({
            type: mappedType, // Default to regular version
            amount: entry.miscellaneous_amount,
            miscDetail: miscDesc,
            miscType: miscDesc,
          });
        }

        // 2. Other cost-based types
        if (entry.miles_cost && entry.miles_cost > 0) {
          rowsToCreate.push({
            type: "Mileage",
            amount: entry.miles_cost,
            miscDetail: "",
            miscType: "",
          });
        }
        if (entry.perdiem_cost && entry.perdiem_cost > 0) {
          rowsToCreate.push({
            type: "PerDiem",
            amount: entry.perdiem_cost,
            miscDetail: "",
            miscType: "",
          });
        }
        if (entry.car_rental_cost && entry.car_rental_cost > 0) {
          rowsToCreate.push({
            type: "CarRental",
            amount: entry.car_rental_cost,
            miscDetail: "",
            miscType: "",
          });
        }
        if (entry.other_expense_cost && entry.other_expense_cost > 0) {
          rowsToCreate.push({
            type: "CabsParking",
            amount: entry.other_expense_cost,
            miscDetail: "",
            miscType: "",
          });
        }
        if (entry.lodging_cost && entry.lodging_cost > 0) {
          rowsToCreate.push({
            type: "Lodge",
            amount: entry.lodging_cost,
            miscDetail: "",
            miscType: "",
          });
        }
        if (entry.destination_cost && entry.destination_cost > 0) {
          rowsToCreate.push({
            type: "Travel",
            amount: entry.destination_cost,
            miscDetail: "",
            miscType: "",
          });
        }

        // Create an XML <row> for each rowToCreate
        rowsToCreate.forEach((row) => {
          xmlContent += `  <row
      ExpenseDate="${expenseDate}T00:00:00"
      EmployeeNumber="${employee?.employee_number || ""}"
      EmployeeName="${employee?.first_name || ""} ${employee?.last_name || ""}"
      Amount="${Number(row.amount).toFixed(4)}"
      Type="${row.type}"
      TransportWhere=""
      ProjectNumber="${entry.project_number || "ProjOver"}"
      Purpose="${expense.message || ""}"
      MiscDetail="${row.miscDetail}"
      MiscType="${row.miscType}"
      EntInfo=" "
    />\n`;
        });
      });
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
