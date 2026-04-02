import { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, getDaysInMonth } from "date-fns";
import HeaderComponent from "./HeaderComponent";
import SubheaderComponent from "./SubheaderComponent";
import RowComponent from "./RowComponent";
import FormTableMobile from "./MobileComponents/FormTableMobile";
import FormActionsButtons from "../../Shared/FormActionButtons";
import TableFooterComponent from "./TableFooterComponent";
import { ExpensesContext } from "../../../../store/expense-context";
import { saveExpenseSheet } from "../../../../util/fetching";
import { calculateColumnTotals } from "../../../../util/helper";
import { toMonthStartDate } from "../../../../util/dateOnly";
import MonthlyDatePicker from "../../Shared/MonthlyDatePicker";
import { useNavigate } from "react-router-dom";
import { FaReceipt } from "react-icons/fa";
import AddReceiptModal from "./AddReceiptModal";
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function getInitialExpenseData(employeeId = null) {
  return {
    approved: false,
    approved_by: "None",
    createdAt: "",
    date_paid: null,
    employee_id: employeeId ?? "",
    employee_name: "",
    id: null,
    message: "None",
    paid: false,
    processed_by: "None",
    signed: false,
    submitted_by: "None",
    num_of_days: "",
    updatedAt: "",
    date_start: "",
    total: "",
  };
}

const intitialEntriesData = [
  {
    ExppenseFiles: [],
    id: null,
    expense_id: "",
    project_id: "",
    purpose: "",
    day: null,
    destination_name: "",
    destination_cost: 0,
    lodging_cost: 0,
    other_expense_cost: 0,
    car_rental_cost: 0,
    miles: 0,
    miles_cost: 0,
    perdiem_cost: 0,
    entertainment_cost: 0,
    miscellaneous_description_id: "",
    miscellaneous_amount: 0,
    createdAt: null,
    updatedAt: null,
  },
];
// Function to calculate the end of the current week (Sunday)
const getStartOfMonth = (date) => {
  return startOfMonth(date);
};

function getInitialExpenseMonth(value) {
  if (value) {
    const monthStart = toMonthStartDate(value);
    if (monthStart) {
      return monthStart;
    }
  }

  return getStartOfMonth(new Date());
}

function hasMeaningfulData(row) {
  const num = (v) => Number(v || 0);
  const str = (v) => (v ?? "").trim();

  const anyNonZeroAmount = [
    "destination_cost",
    "lodging_cost",
    "other_expense_cost",
    "car_rental_cost",
    "miles",
    "miles_cost",
    "perdiem_cost",
    "entertainment_cost",
    "miscellaneous_amount",
  ].some((k) => num(row[k]) !== 0);

  const anyText = str(row.purpose) !== "" || str(row.destination_name) !== "";

  // IMPORTANT: Do NOT consider project_id alone as data (select defaults cause false positives)
  return anyNonZeroAmount || anyText;
}

function isFirstRowForDay(rows, idx) {
  const day = rows[idx]?.day;
  const firstIdx = rows.findIndex((r) => r.day === day);
  return firstIdx === idx;
}

function clearedOriginalRow(row) {
  return {
    ...row,
    id: null, // important: remove id locally since we deleted it in DB
    project_id: "",
    purpose: "",
    destination_name: "",
    destination_cost: 0,
    lodging_cost: 0,
    other_expense_cost: 0,
    car_rental_cost: 0,
    miles: 0,
    miles_cost: 0,
    perdiem_cost: 0,
    entertainment_cost: 0,
    miscellaneous_description_id: "",
    miscellaneous_amount: 0,
  };
}

async function safeParse(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Error parsing expense response:", error);
    }
  }
  return { message: text, internalStatus: "fail" };
}

export default function ExpenseForm({
  expenseEntriesData = intitialEntriesData,
  expenseId = null,
  isEditing = false,
  isAdmin = false,
  initialSelectedDate = null,
  initialEmployee = null,
}) {
  const initialEmployeeId = initialEmployee?.id ?? null;
  const initialFirstName = initialEmployee?.first_name || "";
  const initialLastName = initialEmployee?.last_name || "";

  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialExpenseMonth(initialSelectedDate)
  );
  const [expense, setExpense] = useState(() =>
    getInitialExpenseData(initialEmployeeId)
  );
  const [rowData, setRowData] = useState(expenseEntriesData);
  const [showModal, setShowModal] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedUser, setSelectedUser] = useState({
    id: initialEmployeeId,
    first_name: initialFirstName,
    last_name: initialLastName,
  });

  const expenseCtx = useContext(ExpensesContext);
  const navigate = useNavigate();

  const hydratedRef = useRef(null);
  const expenseEntriesRef = useRef(expenseEntriesData);
  const expensesRef = useRef(expenseCtx.expenses);

  useEffect(() => {
    expenseEntriesRef.current = expenseEntriesData;
  }, [expenseEntriesData]);

  useEffect(() => {
    expensesRef.current = expenseCtx.expenses;
  }, [expenseCtx.expenses]);

  useEffect(() => {
    if (expenseId) {
      return;
    }

    setSelectedDate(getInitialExpenseMonth(initialSelectedDate));
  }, [expenseId, initialSelectedDate]);

  useEffect(() => {
    if (expenseId) {
      return;
    }

    if (initialEmployeeId) {
      setExpense((prevExpense) => ({
        ...prevExpense,
        employee_id: Number(initialEmployeeId),
      }));
      setSelectedUser({
        id: Number(initialEmployeeId),
        first_name: initialFirstName,
        last_name: initialLastName,
      });
      return;
    }

    setExpense((prevExpense) => ({
      ...prevExpense,
      employee_id: "",
    }));
    setSelectedUser({
      id: null,
      first_name: "",
      last_name: "",
    });
  }, [expenseId, initialEmployeeId, initialFirstName, initialLastName]);

  useEffect(() => {
    async function init() {
      if (hydratedRef.current === expenseId) return; // already hydrated for this expenseId
      hydratedRef.current = expenseId;

      let filteredExpense = null;
      if (expenseEntriesRef.current && expenseId) {
        filteredExpense = expensesRef.current.find(
          (expense) => expense.id === parseInt(expenseId)
        );

        if (!filteredExpense) {
          try {
            const response = await fetch(
              `${BASE_URL}/admin/expense/${expenseId}`,
              {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
              }
            );
            const data = await response.json();
            if (response.ok) {
              filteredExpense = data.data[0];
              setSelectedUser(data.data[0].Employee);
            } else {
              console.error("Error fetching expense");
              return;
            }
          } catch (error) {
            console.error("Error fetching expense:", error);
            return;
          }
        }

        if (filteredExpense) {
          const monthStartDate =
            toMonthStartDate(filteredExpense.date_start) || getStartOfMonth(new Date());
          setSelectedDate(monthStartDate);
          setExpense((prevExpense) => ({
            ...prevExpense,
            ...filteredExpense,
            // employee_id: localStorage.getItem("userId"),
            files: filteredExpense.ExpenseFiles || [],
            signed: filteredExpense.signed,
            total: filteredExpense.total,
          }));

          const realDate = monthStartDate;
          const daysInMonth = getDaysInMonth(realDate);
          const fullRows = [];

          for (let day = 1; day <= daysInMonth; day++) {
            const matchingEntries = expenseEntriesRef.current.filter(
              (entry) => entry.day === day
            );
            if (matchingEntries.length > 0) {
              fullRows.push(...matchingEntries);
            } else {
              fullRows.push({
                ...intitialEntriesData[0],
                day,
                date: new Date(
                  realDate.getFullYear(),
                  realDate.getMonth(),
                  day
                ),
              });
            }
          }

          setRowData(fullRows);
        }
      }
    }

    init();
    // only depend on expenseId; do NOT depend on expenseCtx.expenses (that was causing re-hydrates)
  }, [expenseId]);

  useEffect(() => {
    const realDate = new Date(selectedDate);
    const daysInMonth = getDaysInMonth(realDate);
    const fullRows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEntries = expenseEntriesData
        .filter((entry) => entry.day === day)
        // optional: stable sort so duplicate-day entries have predictable order
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

      if (dayEntries.length > 0) {
        fullRows.push(...dayEntries); // keep ALL entries for that day
      } else {
        fullRows.push({
          ...intitialEntriesData[0],
          day,
          date: new Date(realDate.getFullYear(), realDate.getMonth(), day),
        });
      }
    }

    setRowData(fullRows);
  }, [selectedDate, expenseEntriesData]);

  function handleValueChange(rowIndex, field, value) {
    setRowData((prevRows) =>
      prevRows.map((row, index) => {
        if (index === rowIndex) {
          // Update miles_cost if miles field changes
          if (field === "miles") {
            const milesCost = parseFloat(value || 0) * 0.58; // Calculate miles_cost
            return { ...row, [field]: value, miles_cost: milesCost.toFixed(2) };
          }

          // Otherwise, update the specified field
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  }

  async function handleSave() {
    if (isSaving) return; // prevent double click
    setIsSaving(true);
    // ensure a Date instance goes to getDaysInMonth
    const numDays = getDaysInMonth(new Date(selectedDate));
    const total = calculateColumnTotals(rowData);

    // send only meaningful rows (prevents blank sub-rows)
    const filteredRows = rowData.filter(hasMeaningfulData);

    // Deduplicate identical rows (same day + same values) before sending
    const seen = new Set();
    const dedupedRows = [];
    for (const row of filteredRows) {
      const key = JSON.stringify({
        day: row.day ?? null,
        project_id: row.project_id || null,
        purpose: (row.purpose || "").trim(),
        destination_name: (row.destination_name || "").trim(),
        destination_cost: Number(row.destination_cost) || 0,
        lodging_cost: Number(row.lodging_cost) || 0,
        other_expense_cost: Number(row.other_expense_cost) || 0,
        car_rental_cost: Number(row.car_rental_cost) || 0,
        miles: Number(row.miles) || 0,
        miles_cost: Number(row.miles_cost) || 0,
        perdiem_cost: Number(row.perdiem_cost) || 0,
        entertainment_cost: Number(row.entertainment_cost) || 0,
        miscellaneous_description_id:
          Number(row.miscellaneous_description_id) || 1,
        miscellaneous_amount: Number(row.miscellaneous_amount) || 0,
      });
      if (seen.has(key)) continue;
      seen.add(key);
      dedupedRows.push(row);
    }

    const currentUserId = localStorage.getItem("userId");
    const currentUserName = localStorage.getItem("user_name");

    // Keep the original owner when admin; otherwise use existing or current user
    const employeeIdToSend = isAdmin
      ? expense.employee_id
      : expense.employee_id || currentUserId;

    // Only the owner updates submitted_by on sign; admins shouldn't overwrite it
    const submittedByToSend = isAdmin
      ? expense.submitted_by ?? "None"
      : expense.signed
      ? currentUserName || "None"
      : expense.submitted_by ?? "None";

    // Track who processed when admin; otherwise preserve existing
    const processedByToSend = isAdmin
      ? currentUserName || expense.processed_by || "None"
      : expense.processed_by || "None";

    const expenseData = {
      approved: expense.approved,
      approved_by: expense.approved_by,
      date_paid: expense.date_paid,
      employee_id: Number(employeeIdToSend),
      id: Number(expense.id) || expenseId,
      message: expense.message,
      paid: expense.paid,
      processed_by: processedByToSend,
      signed: expense.signed,
      submitted_by: submittedByToSend,
      num_of_days: Number(numDays),
      date_start: toMonthStartDate(selectedDate) || selectedDate,
      total: Number(total.grand_total.toFixed(2)),
    };

    try {
      const res = await saveExpenseSheet(
        expenseData,
        dedupedRows,
        receiptFiles,
        expenseId
      );

      if (res.internalStatus === "success") {
        if (!isEditing) {
          const adminQuery = isAdmin ? "?adminMode=true" : "";
          navigate(
            `/employee-portal/dashboard/expenses/details/${res.data.expense.id}${adminQuery}`
          );
        }
        await expenseCtx.fetchExpenses();
        expenseCtx.triggerSucessOrFailMessage("success", res.message);
        // setReceiptFiles([]);
      } else {
        expenseCtx.triggerSucessOrFailMessage(
          "fail",
          res.message || "Unknown error."
        );
      }
    } catch (error) {
      expenseCtx.triggerSucessOrFailMessage("fail", "Save failed");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSign() {
    setExpense((prevExpense) => ({
      ...prevExpense, // Keep all other fields unchanged
      signed: !prevExpense.signed, // Toggle the signed field
      submitted_by: localStorage.getItem("user_name"),
    }));
  }

  function handleAddSubRow(index) {
    setRowData((prevRows) => {
      const baseRow = prevRows[index];
      const newRow = {
        ...intitialEntriesData[0],
        day: baseRow.day,
        date: baseRow.date,
      };
      return [
        ...prevRows.slice(0, index + 1),
        newRow,
        ...prevRows.slice(index + 1),
      ];
    });
  }

  async function handleDeleteRow(index) {
    const row = rowData[index];

    // ORIGINAL ROW: delete from DB if persisted, keep row in UI (cleared)
    if (isFirstRowForDay(rowData, index)) {
      if (row.id) {
        try {
          const url = `${BASE_URL}/expenses/expense-entry/${row.id}`; // adjust if your mount path differs
          const res = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const data = await safeParse(res);
          if (!res.ok || data.internalStatus !== "success") {
            throw new Error(data?.message || "Failed to delete row");
          }

          // Sync the new total returned by backend
          if (data?.data?.new_total !== undefined) {
            setExpense((prev) => ({ ...prev, total: data.data.new_total }));
          }
        } catch (err) {
          console.error("Delete error (original row):", err);
          expenseCtx.triggerSucessOrFailMessage("fail", "Delete failed");
          return; // don't clear UI if backend delete failed
        }
      }

      // Clear the row visually (and drop id)
      setRowData((prev) =>
        prev.map((r, i) => (i === index ? clearedOriginalRow(r) : r))
      );
      expenseCtx.triggerUpdate();
      expenseCtx.triggerSucessOrFailMessage("success", "Row cleared");
      return;
    }

    // SUBROW: remove from state; if persisted, delete in DB first
    if (!row.id) {
      setRowData((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      const url = `${BASE_URL}/expenses/expense-entry/${row.id}`; // adjust if needed
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await safeParse(res);
      if (!res.ok || data.internalStatus !== "success") {
        throw new Error(data?.message || "Failed to delete row");
      }

      // Remove subrow from UI
      setRowData((prev) => prev.filter((_, i) => i !== index));

      // Sync total
      if (data?.data?.new_total !== undefined) {
        setExpense((prev) => ({ ...prev, total: data.data.new_total }));
      }
      expenseCtx.triggerUpdate();
      expenseCtx.triggerSucessOrFailMessage("success", "Row deleted");
    } catch (err) {
      console.error("Delete error (subrow):", err);
      expenseCtx.triggerSucessOrFailMessage("fail", "Delete failed");
    }
  }

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  function handleSaveReceipts(files) {
    setReceiptFiles(files);
  }

  async function handleCopy() {
    try {
      const nextState = {
        prefillEntries: rowData.map((row) => ({
          ...row,
          id: null, // reset so backend treats as new
          expense_id: null, // should be expense_id
        })),
        prefillDate: selectedDate,
      };

      if (isAdmin) {
        nextState.adminCreate = {
          employeeId: Number(expense.employee_id || selectedUser.id),
          first_name: selectedUser.first_name || "",
          last_name: selectedUser.last_name || "",
        };
      }

      navigate("/employee-portal/dashboard/expenses/create-expense", {
        state: nextState,
      });
    } catch (err) {
      console.error("Error copying timesheet:", err);
    }
  }

  const totals = calculateColumnTotals(rowData);
  const receiptButtonStyles =
    "inline-flex justify-center items-center gap-2 w-full sm:w-auto sm:min-w-[6.5rem] h-10 bg-blue-500 text-white rounded-md text-xs sm:text-sm px-3 hover:bg-blue-400 transition duration-300";

  return (
    <div className="pb-16 md:pb-20">
      <div className="relative flex flex-col xl:flex-row gap-3 xl:gap-5 justify-between px-2 md:px-5 pb-5 items-stretch xl:items-center">
        <MonthlyDatePicker
          onChange={(date) => setSelectedDate(date)}
          selected={selectedDate}
          disabled={expense.approved}
        />
        <button
          onClick={toggleModal}
          title="Import Receipts"
          className={receiptButtonStyles}
        >
          <FaReceipt size={16} />
          <span>Receipts</span>
        </button>
        {isAdmin && (
          <p className="text-red-500 font-bold text-base md:text-xl text-center xl:text-left">
            {selectedUser.first_name} {selectedUser.last_name}
          </p>
        )}
        <FormActionsButtons
          handleSave={handleSave}
          isSaving={isSaving}
          handleSign={handleSign}
          signed={expense.signed}
          disabled={expense.approved}
          href={"/employee-portal/dashboard/expenses/create-expense"}
          handleCopy={handleCopy}
        />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/55 flex justify-center items-center p-3 sm:p-4"
          onClick={toggleModal}
        >
          <AddReceiptModal
            toggleModal={toggleModal}
            onSaveReceipts={handleSaveReceipts}
            savedFiles={expense.files || []}
            receiptFiles={receiptFiles}
            setReceiptFiles={setReceiptFiles}
            disabled={expense.approved}
          />
        </div>
      )}

      <div className="hidden md:block px-2 md:px-5">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[1280px] border-collapse table-auto">
            <HeaderComponent />
            <SubheaderComponent />
            <tbody>
              {rowData.map((row, index) => (
                <RowComponent
                  key={`${row.id || "new"}-${index}`}
                  row={row}
                  index={index}
                  onValueChange={handleValueChange}
                  onAddSubRow={() => handleAddSubRow(index)}
                  onDeleteRow={() => handleDeleteRow(index)}
                  disabled={expense.approved}
                />
              ))}
            </tbody>
            <TableFooterComponent totals={totals} />
          </table>
        </div>
      </div>

      <div className="md:hidden px-2">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <FormTableMobile
            data={rowData}
            onValueChange={handleValueChange}
            onAddSubRow={handleAddSubRow}
            onDeleteRow={handleDeleteRow}
            disabled={expense.approved}
          />
        </div>
      </div>

      <div className="md:hidden px-2 mt-3">
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-600">Month Total</p>
          <p className="text-sm font-semibold text-blue-600">
            ${totals.grand_total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

ExpenseForm.propTypes = {
  expenseEntriesData: PropTypes.array,
  expenseId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.oneOf([null]),
  ]),
  isEditing: PropTypes.bool,
  isAdmin: PropTypes.bool,
  initialSelectedDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.oneOf([null]),
  ]),
  initialEmployee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};
