import { useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ExpensesContext } from "../store/expense-context";
import ExpenseForm from "../components/PortalComponents/Expenses/ExpensesForm/ExpenseForm";
import { encode, decode } from "js-base64";

export default function ExpenseDetail() {
  const params = useParams();
  const [expenseEntriesData, setExpenseEntriesData] = useState([]);
  const [searchParams] = useSearchParams(); // gets query params like adminMode=true
  const adminMode = searchParams?.get("adminMode") === "true"; // boolean

  const expenseCtx = useContext(ExpensesContext);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const realId = params.expenseId; // e.g. "4002"
  const encodedId = encode(realId); // e.g. "NDAwMg=="

  // Replace the visible URL after mount
  useEffect(() => {
    const newUrl = `/employee-portal/dashboard/timesheets/${encodedId}${
      adminMode ? "?adminMode=true" : ""
    }`;

    // Replace only the visible URL — doesn’t trigger navigation
    window.history.replaceState(null, "", newUrl);
  }, [encodedId, adminMode]);

  useEffect(() => {
    async function fetchExpenseEntriesData() {
      try {
        // console.log(params.expenseId);
        const response = await fetch(
          `${baseUrl}/expenses/entries/${params.realId}`,
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
    <div className="my-5 bg-white shadow-md rounded-lg ">
      <ExpenseForm
        expenseEntriesData={expenseEntriesData}
        expenseId={realId}
        isEditing={true}
        isAdmin={adminMode}
      />
    </div>
  );
}
