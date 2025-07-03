export default function FormHeader() {
  return (
    <thead className="bg-blue-500 text-white text-[0.5rem] md:text-xs">
      <tr>
        <th className="border w-[1rem] px-2 py-1 text-center">#</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Project</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Phase</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Cost Code</th>
        <th className="border w-[15rem] px-2 py-1 text-center">Description</th>
        <th className="border w-[3rem]  px-2 py-1 text-center">Mon</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Tue</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Wed</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Thu</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Fri</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Sat</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Sun</th>
        <th className="border w-[3rem] px-2 py-1 text-center">Total</th>
        <th className="border w-[0.5rem] px-2 py-1 text-center"></th>
      </tr>
    </thead>
  );
}
