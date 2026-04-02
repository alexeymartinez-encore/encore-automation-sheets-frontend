import FormBody from "./FormBody";
import FormHeader from "./FormHeader";

export default function FormTable({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  dayLabels,
}) {
  return (
    <table className="w-full min-w-[1080px] table-auto">
      <FormHeader dayLabels={dayLabels} />
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
