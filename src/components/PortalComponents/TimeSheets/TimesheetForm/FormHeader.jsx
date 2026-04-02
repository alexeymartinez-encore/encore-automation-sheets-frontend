const DAY_COLUMNS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function FormHeader({ dayLabels = {} }) {
  return (
    <thead className="bg-blue-500 text-white text-[0.62rem] lg:text-xs">
      <tr>
        <th className="border w-[1rem] px-2 py-1 text-center">#</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Project</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Phase</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Cost Code</th>
        <th className="border w-[15rem] px-2 py-1 text-center">Description</th>
        {DAY_COLUMNS.map((day) => (
          <th key={day.key} className="border w-[4.25rem] px-2 py-1 text-center">
            <span className="block">{day.label}</span>
            <span className="block text-[0.58rem] lg:text-[0.65rem] font-normal">
              {dayLabels[day.key] || ""}
            </span>
          </th>
        ))}
        <th className="border w-[3rem] px-2 py-1 text-center">Total</th>
        <th className="border w-[0.5rem] px-2 py-1 text-center"></th>
      </tr>
    </thead>
  );
}
