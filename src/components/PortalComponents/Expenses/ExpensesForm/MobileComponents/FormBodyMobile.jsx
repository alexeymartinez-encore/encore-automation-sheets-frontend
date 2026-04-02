import RowComponentMobile from "./RowComponentMobile";

export default function FormBodyMobile({
  data,
  onValueChange,
  onAddSubRow,
  onDeleteRow,
  disabled,
}) {
  return (
    <tbody>
      {data.map((row, index) => (
        <RowComponentMobile
          key={`${row.id || "new"}-${index}`}
          row={row}
          index={index}
          onValueChange={onValueChange}
          onAddSubRow={onAddSubRow}
          onDeleteRow={onDeleteRow}
          disabled={disabled}
        />
      ))}
    </tbody>
  );
}
