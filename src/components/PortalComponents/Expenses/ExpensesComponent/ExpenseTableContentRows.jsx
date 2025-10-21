import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ExpensesContext } from "../../../../store/expense-context";
import TableCellRegItem from "../../Shared/TableCellRegItem";
import TableCellStatusItem from "../../Shared/TableCellStatusItem";
import ButtonsContainerCard from "../../Shared/ButtonsContainerCard";
import TableActionButton from "../../Shared/TableActionButton";
import TableContainerCard from "../../Shared/TableContainerCard";
import { formatMonthDate } from "../../../../util/helper";
// import { TimesheetContext } from "../../../store/timesheet-context";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export default function ExpenseTableContentRows({ expense }) {
  const expensetCtx = useContext(ExpensesContext);

  const formattedMonthStartingDate = formatMonthDate(expense.date_start);
  const navigate = useNavigate();

  function handleEdit() {
    navigate(`/employee-portal/dashboard/expenses/${expense.id}`);
  }

  async function handleDelete(id) {
    expensetCtx.deleteExpenseById(id);
  }

  return (
    <TableContainerCard>
      <TableCellRegItem>{formattedMonthStartingDate}</TableCellRegItem>
      <TableCellRegItem mobileStyle={"hidden"}>
        {expense.num_of_days}
      </TableCellRegItem>
      <TableCellStatusItem
        mobileStyle={"hidden md:block"}
        status={expense.signed}
      />
      <TableCellStatusItem
        mobileStyle={"hidden md:block"}
        status={expense.approved}
      />
      <TableCellStatusItem
        mobileStyle={"hidden md:block"}
        status={expense.paid}
      />
      <TableCellRegItem mobileStyle={"hidden md:block"}>
        {expense.submitted_by}
      </TableCellRegItem>
      <TableCellRegItem mobileStyle={"hidden"}>-</TableCellRegItem>
      <TableCellRegItem>$ {expense.total.toFixed(2)}</TableCellRegItem>
      <ButtonsContainerCard>
        <TableActionButton onClick={handleEdit} color={"blue"}>
          <FaEdit className="text-blue-500 size-4 md:size-5" />
        </TableActionButton>

        <TableActionButton
          onClick={() => handleDelete(expense.id)}
          color={"red"}
        >
          <MdDeleteForever
            className={`${
              expense.approved ? "text-red-300" : "text-red-500"
            } size-4 md:size-5`}
          />
        </TableActionButton>
      </ButtonsContainerCard>
    </TableContainerCard>
  );
}
