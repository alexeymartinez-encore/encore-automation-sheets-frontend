import { useContext, useEffect, useState } from "react";
import FormBody from "./FormBody";
import FormHeader from "./FormHeader";
import { TimesheetContext } from "../../../../store/timesheet-context";

export default function FormTable({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  timesheetId,
  onAddDescription,
}) {
  return (
    <table className="w-full overflow-x-auto">
      <FormHeader />
      <FormBody
        data={data}
        onValueChange={onValueChange}
        onDeleteRow={onDeleteRow}
        disabled={disabled}
        // onAddDescription={onAddDescription}
      />
    </table>
  );
}
