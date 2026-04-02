import { useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ExpensesContext } from "../store/expense-context";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import ExpenseForm from "../components/PortalComponents/Expenses/ExpensesForm/ExpenseForm";

export default function ExpenseDetail() {
  const { expenseId } = useParams();
  const [searchParams] = useSearchParams();

  const [expenseEntriesData, setExpenseEntriesData] = useState([]);
  const adminMode = searchParams?.get("adminMode") === "true";
  const expenseCtx = useContext(ExpensesContext);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const realId = expenseId;

  useEffect(() => {
    async function fetchExpenseEntriesData() {
      try {
        const response = await fetch(
          `${baseUrl}/expenses/entries/${realId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Something went wrong");
          return;
        }
        setExpenseEntriesData(data.data);
      } catch (error) {
        console.error("Error during fetching projects:", error);
      }
    }

    fetchExpenseEntriesData();
  }, [baseUrl, realId, expenseCtx.expenses]);

  return (
    <FormContainerCard>
      <ExpenseForm
        expenseEntriesData={expenseEntriesData}
        expenseId={realId}
        isEditing={true}
        isAdmin={adminMode}
      />
    </FormContainerCard>
  );
}
