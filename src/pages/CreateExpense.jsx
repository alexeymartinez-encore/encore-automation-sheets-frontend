import { useLocation } from "react-router-dom";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import ExpenseForm from "../components/PortalComponents/Expenses/ExpensesForm/ExpenseForm";

export default function CreateExpensePage() {
  const location = useLocation();
  const { prefillEntries, prefillDate, adminCreate } = location.state || {};
  const initialEmployee = adminCreate?.employeeId
    ? {
        id: adminCreate.employeeId,
        first_name: adminCreate.first_name || "",
        last_name: adminCreate.last_name || "",
      }
    : null;

  return (
    <FormContainerCard>
      <ExpenseForm
        expenseEntriesData={prefillEntries || []}
        initialSelectedDate={prefillDate}
        expenseId={null}
        isEditing={false}
        isAdmin={Boolean(initialEmployee?.id)}
        initialEmployee={initialEmployee}
      />
    </FormContainerCard>
  );
}
