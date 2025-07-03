import SectionHeader from "../Shared/SectionHeader";
import ExpensesTable from "./ExpensesComponent/ExpensesTable";

export default function Expenses() {
  return (
    <div className="w-full  py-4 overflow-auto">
      <SectionHeader
        section={"Expenses"}
        link={"/employee-portal/dashboard/expenses/create-expense"}
      />
      <ExpensesTable />
    </div>
  );
}
