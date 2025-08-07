import RowComponent from "./RowComponent";

export default function FormBody({
  data,
  onValueChange,
  onDeleteRow,
  disabled,
  // onAddDescription,
}) {
  return (
    <tbody className="w-full ">
      {data.map((row, index) => (
        <RowComponent
          key={index}
          row={row}
          index={index}
          onValueChange={onValueChange}
          onDeleteRow={onDeleteRow} // Pass delete handler
          disabled={disabled}
          // onAddDescription={onAddDescription}
        />
      ))}
    </tbody>
  );
}
// () => handleDeleteRow(index, row)
