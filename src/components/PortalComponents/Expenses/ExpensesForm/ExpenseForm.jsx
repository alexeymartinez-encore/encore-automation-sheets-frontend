import { useState, useEffect, useContext, useRef } from "react";

import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, getDaysInMonth } from "date-fns";
import HeaderComponent from "./HeaderComponent";
import SubheaderComponent from "./SubheaderComponent";
import RowComponent from "./RowComponent";
import FormActionsButtons from "../../Shared/FormActionButtons";
import TableFooterComponent from "./TableFooterComponent";
import { ExpensesContext } from "../../../../store/expense-context";
import { saveExpenseSheet } from "../../../../util/fetching";
import {
  calculateColumnTotals,
  formatMonthDate,
} from "../../../../util/helper";
import MonthlyDatePicker from "../../Shared/MonthlyDatePicker";
import { useNavigate } from "react-router-dom";
import { FaReceipt } from "react-icons/fa";
import AddReceiptModal from "./AddReceiptModal";
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const initialExpenseData = {
  approved: false,
  approved_by: "None",
  createdAt: "",
  date_paid: null,
  employee_id: "",
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

function hasMeaningfulData(row) {
  const num = (v) => Number(v || 0);
  const str = (v) => (v ?? "").trim();

  const anyPositiveAmount = [
    "destination_cost",
    "lodging_cost",
    "other_expense_cost",
    "car_rental_cost",
    "miles",
    "miles_cost",
    "perdiem_cost",
    "entertainment_cost",
    "miscellaneous_amount",
  ].some((k) => num(row[k]) > 0);

  const anyText = str(row.purpose) !== "" || str(row.destination_name) !== "";

  // IMPORTANT: Do NOT consider project_id alone as data (select defaults cause false positives)
  return anyPositiveAmount || anyText;
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
    } catch {}
  }
  return { message: text, internalStatus: "fail" };
}

export default function ExpenseForm({
  expenseEntriesData = intitialEntriesData,
  expenseId = null,
  isEditing = false,
  isAdmin = false,
}) {
  const [selectedDate, setSelectedDate] = useState(getStartOfMonth(new Date()));
  const [expense, setExpense] = useState(initialExpenseData);
  const [rowData, setRowData] = useState(expenseEntriesData);
  const [showModal, setShowModal] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [savedFilesByEntry, setSavedFilesByEntry] = useState({});
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    first_name: "",
    last_name: "",
  });

  const expenseCtx = useContext(ExpensesContext);
  const navigate = useNavigate();

  const hydratedRef = useRef(null);

  useEffect(() => {
    async function init() {
      if (hydratedRef.current === expenseId) return; // already hydrated for this expenseId
      hydratedRef.current = expenseId;

      let filteredExpense = null;
      if (expenseEntriesData && expenseId) {
        filteredExpense = expenseCtx.expenses.find(
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
          const filteredDate = formatMonthDate(
            new Date(filteredExpense.date_start)
          );
          setSelectedDate(filteredDate);
          setExpense((prevExpense) => ({
            ...prevExpense,
            ...filteredExpense,
            // employee_id: localStorage.getItem("userId"),
            files: filteredExpense.ExpenseFiles || [],
            signed: filteredExpense.signed,
            total: filteredExpense.total,
          }));

          // Use filteredDate here, not selectedDate (which hasn't updated yet)
          const realDate = new Date(filteredDate);
          const daysInMonth = getDaysInMonth(realDate);
          const fullRows = [];

          for (let day = 1; day <= daysInMonth; day++) {
            const matchingEntries = expenseEntriesData.filter(
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

          const filesMap = {};
          expenseEntriesData.forEach((entry) => {
            if (entry.files && entry.files.length > 0) {
              filesMap[entry.id] = entry.files.map((file) => ({
                id: file.id,
                url: file.url,
                upload_date: file.upload_date,
              }));
            }
          });
          setSavedFilesByEntry(filesMap);
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
    // ensure a Date instance goes to getDaysInMonth
    const numDays = getDaysInMonth(new Date(selectedDate));
    const total = calculateColumnTotals(rowData);

    // send only meaningful rows (prevents blank sub-rows)
    const filteredRows = rowData.filter(hasMeaningfulData);

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
      date_start: selectedDate,
      total: Number(total.grand_total.toFixed(2)),
    };

    try {
      const res = await saveExpenseSheet(
        expenseData,
        filteredRows,
        receiptFiles,
        expenseId
      );

      if (res.internalStatus === "success") {
        if (!isEditing) {
          navigate(
            `/employee-portal/dashboard/expenses/${res.data.expense.id}`
          );
        }
        expenseCtx.triggerUpdate();
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
      navigate("/employee-portal/dashboard/expenses/create-expense", {
        state: {
          prefillEntries: rowData.map((row) => ({
            ...row,
            id: null, // reset so backend treats as new
            expense_id: null, // 👈 should be expense_id, not timesheet_id
          })),
        },
      });
    } catch (err) {
      console.error("Error copying timesheet:", err);
    }
  }

  return (
    <div>
      <div className="flex gap-5 justify-between px-5 py-3 items-center">
        <div className="flex items-center gap-5">
          <MonthlyDatePicker
            onChange={(date) => setSelectedDate(date)}
            selected={selectedDate}
            disabled={expense.approved}
          />
          <div className="flex">
            {expense.approved ? (
              <></>
            ) : (
              <button
                onClick={toggleModal}
                title="Import Receipts"
                className="flex items-center gap-3  bg-blue-500 py-1 px-3 rounded text-white
                          hover:bg-blue-400 transition duration-300"
                disabled={expense.approved}
              >
                <FaReceipt color="white" size={18} />
                <span>Receipts</span>
              </button>
            )}
            {showModal && (
              <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
                onClick={toggleModal}
              >
                <AddReceiptModal
                  toggleModal={toggleModal}
                  onSaveReceipts={handleSaveReceipts}
                  savedFiles={expense.files || []}
                  receiptFiles={receiptFiles}
                  setReceiptFiles={setReceiptFiles}
                />
              </div>
            )}
          </div>
        </div>
        {isAdmin && (
          <p className="text-red-500 font-bold text-xl">
            {selectedUser.first_name} {selectedUser.last_name}
          </p>
        )}

        <FormActionsButtons
          handleSave={handleSave}
          handleSign={handleSign}
          signed={expense.signed}
          disabled={expense.approved}
          href={"/employee-portal/dashboard/expenses/create-expense"}
          handleCopy={handleCopy}
        />
      </div>
      <table className="w-full border-collapse border ">
        <HeaderComponent />
        <SubheaderComponent />
        <tbody className="overflow-scroll">
          {rowData.map((row, index) => (
            <RowComponent
              key={index}
              row={row}
              index={index}
              onValueChange={handleValueChange}
              onAddSubRow={() => handleAddSubRow(index)}
              onDeleteRow={() => handleDeleteRow(index)}
              disabled={expense.approved}
            />
          ))}
        </tbody>

        <TableFooterComponent totals={calculateColumnTotals(rowData)} />
      </table>
    </div>
  );
}
