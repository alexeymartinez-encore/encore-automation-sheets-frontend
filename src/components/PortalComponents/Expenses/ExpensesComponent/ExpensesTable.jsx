import { useContext, useMemo } from "react";
import ExpensesHeader from "./ExpensesHeader";
import { ExpensesContext } from "../../../../store/expense-context";
import ExpenseTableContentRows from "./ExpenseTableContentRows";

export default function ExpensesTable() {
  const expenseCtx = useContext(ExpensesContext);
  const { expenses = [] } = expenseCtx;

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
      {/* <div className="flex flex-col py-0 md:py-5 overflow-scroll"> */}

      <div className="flex flex-col py-0 md:py-5">
        {sortedExpenses.map((expense) => (
          <ExpenseTableContentRows key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}
