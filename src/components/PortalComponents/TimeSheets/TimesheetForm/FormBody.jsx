import RowComponent from "./RowComponent";

export default function FormBody({
  data,
  onValueChange,
  onDeleteRow,
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
          // onAddDescription={onAddDescription}
        />
      ))}
    </tbody>
  );
}
// () => handleDeleteRow(index, row)
