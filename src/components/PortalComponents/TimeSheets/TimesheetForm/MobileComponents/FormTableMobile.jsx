import FormBodyMobile from "./FormBodyMobile";
import FormHeaderMobile from "./FormHeaderMobile";

export default function FormTableMobile({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
}) {
  return (
    <table className="table md:hidden w-full overflow-x-auto">
      <FormHeaderMobile />
      <FormBodyMobile
        data={data}
        onValueChange={onValueChange}
        onDeleteRow={onDeleteRow}
        disabled={disabled}
      />
    </table>
  );
}
