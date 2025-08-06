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
      <TableCellRegItem>{expense.num_of_days}</TableCellRegItem>
      <TableCellStatusItem status={expense.signed} />
      <TableCellStatusItem status={expense.approved} />
      <TableCellStatusItem status={expense.paid} />
      <TableCellRegItem>{expense.submitted_by}</TableCellRegItem>
      <TableCellRegItem>-</TableCellRegItem>
      <TableCellRegItem>{expense.total}</TableCellRegItem>
      <ButtonsContainerCard>
        <TableActionButton onClick={handleEdit} color={"blue"}>
          <FaEdit className="text-blue-500 size-3 md:size-5" />
        </TableActionButton>

        <TableActionButton
          onClick={() => handleDelete(expense.id)}
          color={"red"}
        >
          <MdDeleteForever
            className={`${
              expense.approved ? "text-red-300" : "text-red-500"
            } size-3 md:size-5`}
          />
        </TableActionButton>
      </ButtonsContainerCard>
    </TableContainerCard>
  );
}
