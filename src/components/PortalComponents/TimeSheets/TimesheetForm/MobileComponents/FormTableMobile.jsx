import FormBodyMobile from "./FormBodyMobile";
import FormHeaderMobile from "./FormHeaderMobile";

export default function FormTableMobile({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  dayLabels,
}) {
  return (
    <table className="table w-full">
      <FormHeaderMobile />
      <FormBodyMobile
        data={data}
        onValueChange={onValueChange}
        onDeleteRow={onDeleteRow}
        disabled={disabled}
        dayLabels={dayLabels}
      />
    </table>
  );
}
