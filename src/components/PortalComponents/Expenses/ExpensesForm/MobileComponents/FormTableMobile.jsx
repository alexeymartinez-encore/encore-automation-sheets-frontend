import FormBodyMobile from "./FormBodyMobile";
import FormHeaderMobile from "./FormHeaderMobile";

export default function FormTableMobile({
  data,
  onValueChange,
  onAddSubRow,
  onDeleteRow,
  disabled,
}) {
  return (
    <table className="w-full table-auto">
      <FormHeaderMobile />
      <FormBodyMobile
        data={data}
        onValueChange={onValueChange}
        onAddSubRow={onAddSubRow}
        onDeleteRow={onDeleteRow}
        disabled={disabled}
      />
    </table>
  );
}
