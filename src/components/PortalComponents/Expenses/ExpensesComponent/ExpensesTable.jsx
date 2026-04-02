import { useContext, useMemo } from "react";
import ExpensesHeader from "./ExpensesHeader";
import { ExpensesContext } from "../../../../store/expense-context";
import ExpenseTableContentRows from "./ExpenseTableContentRows";
import LoadingState from "../../Shared/LoadingState";

export default function ExpensesTable() {
  const expenseCtx = useContext(ExpensesContext);
  const { expenses = [], isLoading } = expenseCtx;

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const da = a?.date_start ? new Date(a.date_start).getTime() : 0;
      const db = b?.date_start ? new Date(b.date_start).getTime() : 0;
      return db - da; // newest first
    });
  }, [expenses]);

  return (
    <div className="flex flex-col bg-white h-full shadow-md rounded-md my-5 text-xs">
      <ExpensesHeader />
      <div className="flex flex-col py-0 md:py-5">
        {isLoading ? (
          <LoadingState
            label="Loading expenses..."
            className="bg-transparent py-10"
          />
        ) : sortedExpenses.length > 0 ? (
          sortedExpenses.map((expense) => (
            <ExpenseTableContentRows key={expense.id} expense={expense} />
          ))
        ) : (
          <p className="px-4 py-8 text-center text-xs text-slate-500">
            No expenses found.
          </p>
        )}
      </div>
    </div>
  );
}
