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
import ConfirmActionModal from "../../Shared/ConfirmActionModal";
import useActionConfirmation from "../../../../hooks/useActionConfirmation";

export default function ExpenseTableContentRows({ expense }) {
  const expensetCtx = useContext(ExpensesContext);
  const {
    confirmationDialog,
    requestConfirmation,
    confirmConfirmation,
    cancelConfirmation,
  } = useActionConfirmation();

  const formattedMonthStartingDate = formatMonthDate(expense.date_start);
  const navigate = useNavigate();

  function handleEdit() {
    navigate(`/employee-portal/dashboard/expenses/details/${expense.id}`);
  }

  async function handleDelete(id) {
    const shouldDelete = await requestConfirmation({
      title: "Delete Expense Sheet?",
      message:
        "This will permanently delete the selected expense sheet. This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!shouldDelete) return;

    await expensetCtx.deleteExpenseById(id);
  }

  return (
    <>
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
      <ConfirmActionModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmLabel={confirmationDialog.confirmLabel}
        cancelLabel={confirmationDialog.cancelLabel}
        tone={confirmationDialog.tone}
        onConfirm={confirmConfirmation}
        onCancel={cancelConfirmation}
      />
    </>
  );
}
