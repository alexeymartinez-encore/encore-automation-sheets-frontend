import FormBody from "./FormBody";
import FormHeader from "./FormHeader";

export default function FormTable({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  timesheetId,
  onAddDescription,
}) {
  return (
    <table className="hidden md:table w-full overflow-x-auto">
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
