import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TimesheetContext } from "../../../../store/timesheet-context";
import TableCellRegItem from "../../Shared/TableCellRegItem";
import TableCellStatusItem from "../../Shared/TableCellStatusItem";
import TableActionButton from "../../Shared/TableActionButton";
// import TableContainerCard from "./TableContainerCard";
import ButtonsContainerCard from "../../Shared/ButtonsContainerCard";
import TableContainerCard from "../../Shared/TableContainerCard";
// import { TimesheetContext } from "../../../store/timesheet-context";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

import { formatWeekendDate } from "../../../../util/helper";
import ConfirmActionModal from "../../Shared/ConfirmActionModal";
import useActionConfirmation from "../../../../hooks/useActionConfirmation";

export default function TableContentRows({ timesheet }) {
  const timesheetCtx = useContext(TimesheetContext);
  const {
    confirmationDialog,
    requestConfirmation,
    confirmConfirmation,
    cancelConfirmation,
  } = useActionConfirmation();

  const formattedWeekEndingDate = formatWeekendDate(timesheet.week_ending);
  const navigate = useNavigate();

  function handleEdit() {
    navigate(`/employee-portal/dashboard/timesheets/details/${timesheet.id}`);
  }

  async function handleDelete(id) {
    const shouldDelete = await requestConfirmation({
      title: "Delete Timesheet?",
      message:
        "This will permanently delete the selected timesheet. This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!shouldDelete) return;

    await timesheetCtx.deleteTimesheetById(id);
  }

  return (
    <>
      <TableContainerCard>
        <TableCellRegItem>{formattedWeekEndingDate}</TableCellRegItem>

        <TableCellStatusItem
          mobileStyle={"hidden md:block"}
          status={timesheet.signed}
        />
        <TableCellStatusItem
          mobileStyle={"hidden md:block"}
          status={timesheet.approved}
        />
        <TableCellStatusItem
          mobileStyle={"hidden md:block"}
          status={timesheet.processed}
        />

        <TableCellRegItem mobileStyle={"hidden md:block"}>
          {timesheet.submitted_by}
        </TableCellRegItem>
        <TableCellRegItem mobileStyle={"hidden md:block"}>
          {timesheet.total_reg_hours}
        </TableCellRegItem>
        <TableCellRegItem mobileStyle={"hidden md:block"}>
          {timesheet.total_overtime}
        </TableCellRegItem>
        <TableCellRegItem>
          {timesheet.total_reg_hours + timesheet.total_overtime}
        </TableCellRegItem>
        <ButtonsContainerCard>
          <TableActionButton onClick={handleEdit} color={"blue"}>
            <FaEdit className="text-blue-500 size-4 md:size-5" />
          </TableActionButton>

          <TableActionButton
            onClick={() => handleDelete(timesheet.id)}
            color={"red"}
            disabled={timesheet.approved}
          >
            <MdDeleteForever
              className={`${
                timesheet.approved ? "text-red-300" : "text-red-500"
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
