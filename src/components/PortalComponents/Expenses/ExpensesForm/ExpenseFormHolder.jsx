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

export default function ExpenseForm({
  expenseEntriesData = intitialEntriesData,
  expenseId = null,
}) {
  const [selectedDate, setSelectedDate] = useState(getStartOfMonth(new Date()));
  const [expense, setExpense] = useState(initialExpenseData);
  const [rowData, setRowData] = useState(expenseEntriesData);
  const [saved, setSaved] = useState(expenseId ? true : false);

  const expenseCtx = useContext(ExpensesContext);
  let filteredExpense;
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
          signed: filteredExpense.signed,
          total: filteredExpense.total,
          employee_id: localStorage.getItem("userId"),
        }));
      }

      // ✅ Build full list: real entries + empty rows for missing days
      const daysInMonth = getDaysInMonth(new Date());
      const fullRows = [];

      for (let day = 1; day <= daysInMonth; day++) {
        // find if any entry for that day exists
        const matchingEntries = expenseEntriesData.filter(
          (entry) => entry.day === day
        );
        if (matchingEntries.length > 0) {
          // add all existing entries for that day
          fullRows.push(...matchingEntries);
        } else {
          // no entry, add blank
          fullRows.push({
            ...intitialEntriesData[0],
            day: day,
            date: new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              day
            ),
          });
        }
      }

      setRowData(fullRows);
    }
  }, [
    expenseEntriesData,
    expenseId,
    expenseCtx.expenses,
    expenseCtx.triggerUpdate,
  ]);

  // Function to populate rowData based on the number of days in the selected month
  useEffect(() => {
    if (!expenseId) {
      const daysInMonth = getDaysInMonth(selectedDate);
      const rows = Array.from({ length: daysInMonth }, (_, index) => {
        // Clone the initial entries data for each row
        const baseEntry = {
          ...expenseEntriesData[0], // Clone the first entry
          // Unique identifier for each row
          day: index + 1, // Day of the month
          date: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
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

    // ✅ ONLY send rows that have at least 1 field filled
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
      const expenseRequestBody = {
        expenseData: expenseData,
        expenseEntriesData: filteredRows, // ONLY send the filled rows!
      };

      const res = await saveExpenseSheet(expenseRequestBody, expenseId);

      if (res.internalStatus === "success" && res.data) {
        setRowData(
          res.data.entries.length > 0 ? res.data.entries : intitialEntriesData
        );
        setExpense(
          res.data.expense.length > 0 ? res.data.expense : initialExpenseData
        );
        setSaved((prevState) => !prevState);

        expenseCtx.triggerSucessOrFailMessage("success", res.message);

        // ✅ After save, redirect to edit page of that expense
        window.location.href = `/portal/expenses/${res.data.expense.id}`;
      } else {
        expenseCtx.triggerSucessOrFailMessage("fail", res.message);
      }

      expenseCtx.triggerUpdate();
    } catch (error) {
      expenseCtx.triggerSucessOrFailMessage(
        "fail",
        `Expense ${expenseId || expense.id ? "update" : "creation"} failed!`
      );
      console.error("Error saving Expense:", error);
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

  return (
    <div>
      <div className="flex gap-5 justify-between px-20 py-3">
        <MonthlyDatePicker
          onChange={(date) => setSelectedDate(date)}
          selected={formatMonthDate(selectedDate)}
        />
        <FormActionsButtons
          handleSave={handleSave}
          handleSign={handleSign}
          signed={expense.signed}
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
