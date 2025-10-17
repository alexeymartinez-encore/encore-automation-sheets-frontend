import { Link } from "react-router-dom";

export default function TableRow({ timesheet, index, onValueChange }) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-9 py-1 px-3  items-center text-[0.6rem] md:text-[0.7rem] rounded-b-md text-center">
      <Link
        to={`/employee-portal/dashboard/timesheets/${timesheet.id}?adminMode=true`}
        className="text-left underline text-blue-500 "
      >
        {timesheet.last_name}
      </Link>
      <p className="text-left">{timesheet.first_name}</p>
      {/* <p className="text-center hidden md:block">{timesheet.message}</p> */}
      <input
        className=" md:text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="signed"
        checked={timesheet.signed}
        onChange={() => onValueChange(index, "signed")}
      />
      <input
        className="md:text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="approved"
        checked={timesheet.approved}
        onChange={() => onValueChange(index, "approved")}
      />
      <input
        className="text-center h-[0.5rem] md:h-[0.7rem] hidden md:block"
        type="checkbox"
        name="processed"
        checked={timesheet.processed}
        onChange={() => onValueChange(index, "processed")}
      />
      <p className="text-center hidden md:block">{timesheet.submitted_by}</p>
      {/* <p className="text-center hidden md:block">
        {timesheet.date_processed ? timesheet.date_processed : "-"}
      </p> */}
      <p className="text-center hidden md:block">{timesheet.total_reg_hours}</p>
      <p className="text-center">{timesheet.total_overtime}</p>
      <p className="text-center">
        {timesheet.total_reg_hours + timesheet.total_overtime}
      </p>
    </div>
  );
}
