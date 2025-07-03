import { useContext } from "react";
import ExpensesHeader from "./ExpensesHeader";
import { ExpensesContext } from "../../../../store/expense-context";
import ExpenseTableContentRows from "./ExpenseTableContentRows";

export default function ExpensesTable() {
  const expenseCtx = useContext(ExpensesContext);

  return (
    <div className="flex flex-col bg-white h-full shadow-md rounded-md my-5 text-xs">
      <ExpensesHeader />
      <div className="flex flex-col py-0 md:py-5 overflow-scroll">
        {/* <ExpensesCard /> */}
        {expenseCtx.expenses.map((expense) => (
          <ExpenseTableContentRows key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}
