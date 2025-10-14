import RowComponentMobile from "./RowComponentMobile";

export default function FormBodyMobile({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
}) {
  return (
    <tbody className="w-full ">
      {data.map((row, index) => (
        <RowComponentMobile
          key={index}
          row={row}
          index={index}
          onValueChange={onValueChange}
          onDeleteRow={onDeleteRow} // Pass delete handler
          disabled={disabled}
        />
      ))}
    </tbody>
  );
}
// () => handleDeleteRow(index, row)
