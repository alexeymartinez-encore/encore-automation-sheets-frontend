import { createContext, useEffect, useState } from "react";
import { isAuth } from "../util/fetching";

// Create the context and provide default values
export const ExpensesContext = createContext({
  expenses: [],
  updated: null,
  triggerUpdate: () => {},
  fetchExpenses: () => {}, // Expose a function to refetch expenses
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  deleteExpenseById: (id) => {},
});

export default function ExpenseContextProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  async function fetchExpenses() {
    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(`${BASE_URL}/expenses/${userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        // console.log(data);
        setExpenses(data.data);
        setUpdated(false);
      } else {
        console.log("Error fetching timesheets");
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    }
  }

  async function deleteExpenseById(id) {
    if (id) {
      try {
        const deleteResponse = await fetch(
          `${BASE_URL}/expenses/delete-expense/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Error deletting the row from the server");
        }
        // console.log(deleteResponse);
        // console.log(`Row with id ${id} deleted successfully from the server`);
        triggerUpdate();
        triggerSucessOrFailMessage("success", "Expense Deleted Successfuly");
        return deleteResponse;
      } catch (error) {
        console.error("Error deleting row: ", error);
        return;
      }
    } else {
      triggerSucessOrFailMessage("fail", "Timesheet Failed to be Deleted");
      return;
    }
  }

  useEffect(() => {
    async function init() {
      const authenticated = await isAuth(); // 👈 actually calls isAuth and gets true/false
      if (authenticated) {
        fetchExpenses();
      }
    }
    init();
  }, [updated]);

  function triggerUpdate() {
    setUpdated(true);
    // setUpdated((prev) => !prev);
  }

  function triggerSucessOrFailMessage(status, message) {
    setSuccessOrFailMessage({
      successStatus: status, // needs to be "success" or "fail"
      message: message,
    });

    // Set a timeout to reset the state after 3 seconds (3000 ms)
    setTimeout(() => {
      setSuccessOrFailMessage({
        successStatus: "",
        message: "",
      });
    }, 5000);
  }

  const expensesCtxValues = {
    expenses: expenses,
    fetchExpenses: fetchExpenses,
    triggerUpdate: triggerUpdate,
    triggerSucessOrFailMessage: triggerSucessOrFailMessage,
    successOrFailMessage: successOrFailMessage,
    deleteExpenseById: deleteExpenseById,
  };

  return (
    <ExpensesContext.Provider value={expensesCtxValues}>
      {children}
    </ExpensesContext.Provider>
  );
}
