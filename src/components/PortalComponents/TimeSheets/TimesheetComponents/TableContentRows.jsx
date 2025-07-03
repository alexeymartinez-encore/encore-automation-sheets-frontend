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

export default function TableContentRows({ timesheet }) {
  const timesheetCtx = useContext(TimesheetContext);

  const formattedWeekEndingDate = formatWeekendDate(timesheet.week_ending);
  // console.log("TIMESHEET ID: " + timesheet.id);
  // console.log(timesheet);
  const navigate = useNavigate();

  function handleEdit() {
    navigate(`/employee-portal/dashboard/timesheets/${timesheet.id}`);
  }

  async function handleDelete(id) {
    timesheetCtx.deleteTimesheetById(id);
  }

  console.log("FORMATTED DATE: ", formattedWeekEndingDate);

  return (
    <TableContainerCard>
      <TableCellRegItem>{formattedWeekEndingDate}</TableCellRegItem>
      <TableCellStatusItem status={timesheet.signed} />
      <TableCellStatusItem status={timesheet.approved} />
      <TableCellStatusItem status={timesheet.processed} />
      <TableCellRegItem>{timesheet.submitted_by}</TableCellRegItem>
      <TableCellRegItem>{timesheet.total_reg_hours}</TableCellRegItem>
      <TableCellRegItem>{timesheet.total_overtime}</TableCellRegItem>
      <TableCellRegItem>
        {timesheet.total_reg_hours + timesheet.total_overtime}
      </TableCellRegItem>
      <ButtonsContainerCard>
        <TableActionButton onClick={handleEdit} color={"blue"}>
          <FaEdit className="text-blue-500 size-3 md:size-5" />
        </TableActionButton>

        <TableActionButton
          onClick={() => handleDelete(timesheet.id)}
          color={"red"}
        >
          <MdDeleteForever className="text-red-500 size-3 md:size-5" />
        </TableActionButton>
      </ButtonsContainerCard>
    </TableContainerCard>
  );
}
