import { useContext, useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TaskBar from "./TaskBar";
import { AdminContext } from "../../../../../store/admin-context";
import { getStartOfMonth } from "../../../../../util/helper";
import { ExpensesContext } from "../../../../../store/expense-context";
import { AuthContext } from "../../../../../store/auth-context";
import { getAuthUserId, getAuthUserName } from "../../../../../util/authUser";
import LoadingState from "../../../Shared/LoadingState";
import ConfirmActionModal from "../../../Shared/ConfirmActionModal";
import useActionConfirmation from "../../../../../hooks/useActionConfirmation";

export default function ManageExpensesTable() {
  const [selectedDate, setSelectedDate] = useState(getStartOfMonth(new Date()));
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const adminCtx = useContext(AdminContext);
  const expenseCtx = useContext(ExpensesContext);
  const authCtx = useContext(AuthContext);
  const currentUserId = getAuthUserId(authCtx.user);
  const currentUserName = getAuthUserName(authCtx.user) || "Unknown User";
  const {
    confirmationDialog,
    requestConfirmation,
    confirmConfirmation,
    cancelConfirmation,
  } = useActionConfirmation();

  const [isToggled, setIsToggled] = useState(false);
  const expenseMode = !isToggled ? "Open Expenses" : "Expenses By Date";

  async function handleToggle() {
    const nextState = !isToggled; // what we're switching to
    setIsToggled(nextState);
    setIsLoading(true);
    if (!currentUserId) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }
    const isoDate = new Date(selectedDate).toISOString();

    // Same logic as your first snippet:
    // true  -> getOpenExpenses
    // false -> getUsersExpensesByDate(selectedDate)
    try {
      const res = nextState
        ? await adminCtx.getOpenExpenses()
        : await adminCtx.getUsersExpensesByDate(isoDate);

      const filtered = (res ?? []).filter(
        (ts) => Number(ts.manager_id) === currentUserId
      );

      setExpenses(filtered);
    } finally {
      setIsLoading(false);
    }
  }

  function handleValueChange(index, field, value) {
    setExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      const isChecked =
        value === "true" ? true : !updatedExpenses[index][field];

      updatedExpenses[index] = {
        ...updatedExpenses[index],
        [field]: isChecked, // Update the checkbox field
        ...(field === "signed" && isChecked && { submitted_by: currentUserName }),
        ...(field === "approved" && isChecked && { approved_by: currentUserName }),
        ...(field === "paid" && isChecked && { processed_by: currentUserName }),
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
      setIsLoading(true);
      if (!currentUserId) {
        setExpenses([]);
        setIsLoading(false);
        return;
      }
      const isoDate = new Date(selectedDate).toISOString();

      try {
        const res = await adminCtx.getUsersExpensesByDate(isoDate);
        const filtered = (res || []).filter(
          (ts) => Number(ts.manager_id) === currentUserId
        );
        setExpenses(filtered || []);
      } finally {
        setIsLoading(false);
      }
    }
    getExpenses();
  }, [adminCtx, currentUserId, selectedDate]);

  //   useEffect(() => {
  //   async function getExpenses() {
  //     console.log("=========EXPENSES REGULAR DATE===========");
  //     console.log(selectedDate);
  //     const isoDate = new Date(selectedDate).toISOString();
  //     console.log("=========EXPENSES ISO DATE===========");
  //     console.log(isoDate); // 2025-08-11T00:59:42.000Z (UTC time)
  //     const res = await adminCtx.getUsersExpensesByDate(isoDate);
  //     setExpenses(res || []);
  //   }
  //   getExpenses();
  // }, [selectedDate]);
  async function handleSaveStatusChanges() {
    const res = await adminCtx.saveExpensesStatusChanges(expenses);
    if (res.internalStatus === "success") {
      expenseCtx.triggerUpdate();
    }
  }

  async function handleSaveStatusChangesWithConfirmation() {
    const shouldSave = await requestConfirmation({
      title: "Save Status Changes?",
      message:
        "This will apply the modified signed/approved/paid status values to these expense sheets.",
      confirmLabel: "Save",
    });
    if (!shouldSave) return;

    await handleSaveStatusChanges();
  }

  function handleSetAllApproved() {
    setExpenses((prevExpenses) => {
      const allApproved = prevExpenses.every((expense) => expense.approved);

      return prevExpenses.map((expense) => ({
        ...expense,
        approved: !allApproved, // Toggle the approved state
        approved_by: !allApproved ? currentUserName : "", // Set approved_by only if approving
      }));
    });
  }

  async function handleSetAllApprovedWithConfirmation() {
    const shouldProceed = await requestConfirmation({
      title: "Apply 'Set All Approved'?",
      message:
        "This will toggle the Approved status for all rows currently shown in the table.",
      confirmLabel: "Apply",
    });
    if (!shouldProceed) return;

    handleSetAllApproved();
  }

  function handleSetAllProcessed() {
    setExpenses((prevExpenses) => {
      const allProcessed = prevExpenses.every((expense) => expense.paid);

      return prevExpenses.map((expense) => ({
        ...expense,
        paid: !allProcessed, // Toggle the processed state
        processed_by: !allProcessed ? currentUserName : "", // Set processed_by only if processing
      }));
    });
  }

  async function handleSetAllProcessedWithConfirmation() {
    const shouldProceed = await requestConfirmation({
      title: "Apply 'Set All Paid'?",
      message:
        "This will toggle the Paid status for all rows currently shown in the table.",
      confirmLabel: "Apply",
    });
    if (!shouldProceed) return;

    handleSetAllProcessed();
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
      "Employee Relations": "EmplyRelat",
    };

    const normalizeReportType = (type) =>
      (
        {
          Bereavement: "Bereavem",
          EmpRelat: "EmplyRelat",
          EmpRelatSGA: "EmplyRelatSGA",
          EmpRel: "EmplyRelat",
        }
      )[type] || type;

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
      Type="${normalizeReportType(row.type)}"
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
        saveChanges={handleSaveStatusChangesWithConfirmation}
        setAllApproved={handleSetAllApprovedWithConfirmation}
        setAllPaid={handleSetAllProcessedWithConfirmation}
        generateReport={generateExpenseReport}
        isToggled={isToggled}
        handleToggle={handleToggle}
        expenseMode={expenseMode}
      />
      <TableHeader />
      <div className="bg-white my-1 rounded-md shadow-sm">
        {isLoading ? (
          <LoadingState
            label="Loading manager expenses..."
            className="bg-transparent py-6"
          />
        ) : expenses && expenses.length > 0 ? (
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
      <ConfirmActionModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmLabel={confirmationDialog.confirmLabel}
        cancelLabel={confirmationDialog.cancelLabel}
        tone={confirmationDialog.tone}
        onConfirm={confirmConfirmation}
        onCancel={cancelConfirmation}
      />
    </div>
  );
}
