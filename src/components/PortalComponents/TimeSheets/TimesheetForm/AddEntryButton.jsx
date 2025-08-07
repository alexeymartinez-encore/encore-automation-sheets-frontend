export default function AddEntryButton({ onClick }) {
  return (
    <div className="flex justify-center py-5 text-xs">
      <button
        onClick={onClick}
        className="bg-blue-500 text-white px-5 py-2 rounded-sm shadow-md hover:bg-blue-400 transition duration-500 text-[0.7rem] md:text-sm"
      >
        Add Row
      </button>
    </div>
  );
}
