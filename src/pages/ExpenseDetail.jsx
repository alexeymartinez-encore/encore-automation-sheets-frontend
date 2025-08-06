import { useParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import { ExpensesContext } from "../store/expense-context";
import ExpenseForm from "../components/PortalComponents/Expenses/ExpensesForm/ExpenseForm";

export default function ExpenseDetail() {
  const params = useParams();
  const [expenseEntriesData, setExpenseEntriesData] = useState([]);

  const expenseCtx = useContext(ExpensesContext);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    async function fetchExpenseEntriesData() {
      try {
        // console.log(params.expenseId);
        const response = await fetch(
          `${baseUrl}/expenses/entries/${params.expenseId}`,
          {
            headers: {
              // Authorization: "Bearer " + token,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Error during fetching projects:", error);
          return;
        }

        const data = await response.json();
        setExpenseEntriesData(data.data);
      } catch (error) {
        console.error("Error during fetching projects:", error);
      }
    }

    fetchExpenseEntriesData();
  }, [expenseCtx.data]);

  return (
    <div className="my-5 bg-white shadow-md rounded-lg overflow-x-scroll">
      <ExpenseForm
        expenseEntriesData={expenseEntriesData}
        expenseId={params.expenseId}
      />
    </div>
  );
}
