import React, { useState, useEffect, useContext } from "react";
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

const initialExpenseData = {
  approved: false,
  approved_by: "None",
  createdAt: "",
  date_paid: null,
  employee_id: "",
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

function toRealDate(date) {
  return date instanceof Date ? date : new Date(date);
}

export default function ExpenseForm({
  expenseEntriesData = intitialEntriesData,
  expenseId = null,
}) {
  const [selectedDate, setSelectedDate] = useState(getStartOfMonth(new Date()));
  const [expense, setExpense] = useState(initialExpenseData);
  const [rowData, setRowData] = useState(expenseEntriesData);
  const [saved, setSaved] = useState(expenseId ? true : false);
  const [showModal, setShowModal] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [savedFilesByEntry, setSavedFilesByEntry] = useState({});

  const expenseCtx = useContext(ExpensesContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (expenseEntriesData && expenseId && expenseCtx.expenses.length) {
      const filteredExpense = expenseCtx.expenses.find(
        (expense) => expense.id === parseInt(expenseId)
      );
      if (filteredExpense) {
        const filteredDate = formatMonthDate(
          new Date(filteredExpense.date_start)
        );
        setSelectedDate(filteredDate);
        setExpense((prevExpense) => ({
          ...prevExpense,
          ...filteredExpense, // bring all fields (including id, approved, etc.)
          employee_id: localStorage.getItem("userId"),
          files: filteredExpense.ExpenseFiles || [], // make sure files are available
          signed: filteredExpense.signed, // ensure explicit override
          total: filteredExpense.total, // ensure explicit override
        }));
      }

      const realDate = new Date(selectedDate);
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
            day: day,
            date: new Date(realDate.getFullYear(), realDate.getMonth(), day),
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
  }, [
    expenseEntriesData,
    expenseId,
    expenseCtx.expenses,
    // expenseCtx.triggerUpdate,
  ]);

  // Function to populate rowData based on the number of days in the selected month
  useEffect(() => {
    if (!expenseId) {
      const realDate = new Date(selectedDate);

      const daysInMonth = getDaysInMonth(realDate);
      const rows = Array.from({ length: daysInMonth }, (_, index) => {
        // Clone the initial entries data for each row
        const baseEntry = {
          ...expenseEntriesData[0], // Clone the first entry
          // Unique identifier for each row
          day: index + 1, // Day of the month
          date: new Date(
            realDate.getFullYear(),
            realDate.getMonth(),
            index + 1
          ),
        };
        return baseEntry;
      });
      setRowData(rows);
    } else {
      setRowData(expenseEntriesData);
    }
  }, [selectedDate]);

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
    const num_of_days = getDaysInMonth(selectedDate);
    const total = calculateColumnTotals(rowData);

    // Filter only rows with data
    const filteredRows = rowData.filter((row) => {
      return (
        row.project_id ||
        row.purpose ||
        row.destination_name ||
        row.destination_cost ||
        row.lodging_cost ||
        row.other_expense_cost ||
        row.car_rental_cost ||
        row.miles ||
        row.perdiem_cost ||
        row.entertainment_cost ||
        row.miscellaneous_amount
      );
    });

    const expenseData = {
      approved: expense.approved,
      approved_by: expense.approved_by,
      date_paid: expense.date_paid,
      employee_id: localStorage.getItem("userId"),
      id: Number(expense.id) || expenseId,
      message: expense.message,
      paid: expense.paid,
      processed_by: expense.processed_by,
      signed: expense.signed,
      submitted_by: expense.signed ? localStorage.getItem("user_name") : "None",
      num_of_days: Number(num_of_days),
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
        if (!expenseId) {
          navigate(
            `/employee-portal/dashboard/expenses/${res.data.expense.id}`
          );
        }
        expenseCtx.triggerUpdate();
        expenseCtx.triggerSucessOrFailMessage("success", res.message);
        setReceiptFiles([]);
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

  function toggleModal() {
    setShowModal((prev) => !prev);
  }

  function handleSaveReceipts(files) {
    setReceiptFiles(files);
  }

  return (
    <div>
      <div className="flex gap-5 justify-between px-5 py-3">
        <div className="flex items-center gap-5">
          <MonthlyDatePicker
            onChange={(date) => setSelectedDate(date)}
            selected={selectedDate}
          />
          <div className="flex">
            <button
              onClick={toggleModal}
              title="Import Receipts"
              className="flex items-center gap-3  bg-blue-500 py-1 px-3 rounded text-white
                          hover:bg-blue-400 transition duration-300"
            >
              <FaReceipt color="white" size={18} />
              <span>Attach Receipts</span>
            </button>
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

        <FormActionsButtons
          handleSave={handleSave}
          handleSign={handleSign}
          signed={expense.signed}
          href={"/employee-portal/dashboard/expenses/create-expense"}
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
            />
          ))}
        </tbody>

        <TableFooterComponent totals={calculateColumnTotals(rowData)} />
      </table>
    </div>
  );
}
