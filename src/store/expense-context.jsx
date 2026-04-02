import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { isAuth } from "../util/fetching";

// Create the context and provide default values
export const ExpensesContext = createContext({
  expenses: [],
  updated: null,
  triggerUpdate: () => {},
  fetchExpenses: () => {}, // Expose a function to refetch expenses
  successOrFailMessage: null,
  triggerSucessOrFailMessage: () => {},
  deleteExpenseById: () => {},
});

export default function ExpenseContextProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [updated, setUpdated] = useState(0);
  const [successOrFailMessage, setSuccessOrFailMessage] = useState({
    successStatus: "",
    message: "",
  });
  const latestFetchIdRef = useRef(0);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const fetchExpenses = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const fetchId = latestFetchIdRef.current + 1;
    latestFetchIdRef.current = fetchId;

    try {
      const response = await fetch(`${BASE_URL}/expenses/${userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        if (fetchId === latestFetchIdRef.current) {
          setExpenses(data.data || []);
        }
        return data.data || [];
      } else {
        console.log("Error fetching timesheets");
        return [];
      }
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      return [];
    }
  }, [BASE_URL]);

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
  }, [fetchExpenses, updated]);

  function triggerUpdate() {
    setUpdated((previousValue) => previousValue + 1);
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

ExpenseContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
