export default function ExpensesCard() {
  return (
    <div className="flex justify-between items-center p-3 border-b font-light">
      <p className="flex-1 text-center">08-09-2024</p>
      <p className="flex-1 text-center">31</p>
      <p className="flex-1 text-center text-green-600">Yes</p>
      <p className="flex-1 text-center text-green-600">Yes</p>
      <p className="flex-1 text-center text-red-600">No</p>
      <p className="flex-1 text-center">amartinez</p>
      <p className="flex-1 text-center">-</p>
      <p className="flex-1 text-center">$328.89</p>
      <div className="flex flex-1 justify-around">
        <button
          // onClick={handleEdit}
          className="text-center bg-blue-500 px-2 py-1 text-white rounded-sm hover:bg-blue-400 transition duration-300"
        >
          Edit
        </button>
        <button
          // onClick={() => handleDelete(timesheet.id)}
          className="text-center bg-red-600 px-2 py-1 text-white rounded-sm hover:bg-red-500 transition duration-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
