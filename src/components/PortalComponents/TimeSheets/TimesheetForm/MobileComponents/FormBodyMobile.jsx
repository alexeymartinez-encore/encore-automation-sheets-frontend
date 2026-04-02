import RowComponentMobile from "./RowComponentMobile";

export default function FormBodyMobile({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  dayLabels,
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
          dayLabels={dayLabels}
        />
      ))}
    </tbody>
  );
}
// () => handleDeleteRow(index, row)
