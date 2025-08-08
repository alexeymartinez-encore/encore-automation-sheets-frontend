export default function TableRow({ timesheet, index, onValueChange }) {
  return (
    <div className="flex justify-between p-3 items-center text-[0.5rem] md:text-[0.7rem] rounded-b-md">
      <p className="flex-1 text-center">{timesheet.last_name}</p>
      <p className="flex-1 text-center">{timesheet.first_name}</p>
      <p className="flex-1 text-center hidden md:flex">{timesheet.message}</p>
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="signed"
        checked={timesheet.signed}
        onChange={() => onValueChange(index, "signed")}
      />
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="approved"
        checked={timesheet.approved}
        onChange={() => onValueChange(index, "approved")}
      />
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="processed"
        checked={timesheet.processed}
        onChange={() => onValueChange(index, "processed")}
      />
      <p className="flex-1 text-center">{timesheet.submitted_by}</p>
      <p className="flex-1 text-center hidden md:block">
        {timesheet.date_processed ? timesheet.date_processed : "-"}
      </p>
      <p className="flex-1 text-center">{timesheet.total_reg_hours}</p>
      <p className="flex-1 text-center">{timesheet.total_overtime}</p>
      <p className="flex-1 text-center">
        {timesheet.total_reg_hours + timesheet.total_overtime}
      </p>
    </div>
  );
}
