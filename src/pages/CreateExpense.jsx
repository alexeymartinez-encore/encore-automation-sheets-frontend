import { useLocation } from "react-router-dom";
import ExpenseForm from "../components/PortalComponents/Expenses/ExpensesForm/ExpenseForm";

export default function CreateExpensePage() {
  const location = useLocation();
  const { prefillEntries } = location.state || {};

  return (
    <div className="my-5 bg-white shadow-md rounded-lg pb-10 overflow-x-scroll">
      <ExpenseForm
        expenseEntriesData={prefillEntries || []}
        expenseId={null}
        isEditing={false}
        isAdmin={false}
      />
    </div>
  );
}
