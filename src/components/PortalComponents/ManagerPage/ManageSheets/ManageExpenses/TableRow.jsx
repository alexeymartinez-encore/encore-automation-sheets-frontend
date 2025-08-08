import { Link } from "react-router-dom";

export default function TableRow({ expense, index, onValueChange }) {
  return (
    <div className="flex justify-between items-center p-3 text-[0.5rem] md:text-[0.7rem] ">
      <Link
        to={`/employee-portal/dashboard/expenses/${expense.id}`}
        className="flex-1 text-center underline text-blue-500"
      >
        {expense.last_name}
      </Link>
      <p className="flex-1 text-center">{expense.first_name}</p>
      {/* <p className="flex-1 text-center">{expense.date_start}</p>  */}
      <p className="flex-1 text-center">{expense.num_of_days}</p>
      {/* <p className="flex-1 text-center">{expense.signed ? "Yes" : "No"}</p> */}
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="signed"
        checked={expense.signed}
        onChange={() => onValueChange(index, "signed")}
      />
      {/* <p className="flex-1 text-center">{expense.approved ? "Yes" : "No"}</p> */}
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="approved"
        checked={expense.approved}
        onChange={() => onValueChange(index, "approved")}
      />
      {/* <p className="flex-1 text-center">{expense.paid ? "Yes" : "No"}</p> */}
      <input
        className="flex-1 text-center h-[0.5rem] md:h-[0.7rem]"
        type="checkbox"
        name="paid"
        checked={expense.paid}
        onChange={() => onValueChange(index, "paid")}
      />
      <p className="flex-1 text-center">{expense.submitted_by}</p>
      <p className="flex-1 text-center">
        {expense.date_paid ? expense.date_paid : "-"}
      </p>
      <p className="flex-1 text-center">$ {expense.total.toFixed(2)}</p>
    </div>
  );
}
