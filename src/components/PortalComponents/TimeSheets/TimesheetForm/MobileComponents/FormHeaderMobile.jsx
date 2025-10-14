export default function FormHeaderMobile() {
  return (
    <thead className="bg-blue-500 text-white text-[0.5rem] md:text-xs">
      <tr>
        <th className="border w-[1rem] px-2 py-1 text-center"></th>
        <th className="border w-[5rem] px-2 py-1 text-center">Project</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Phase</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Cost Code</th>

        <th className="border w-[3rem] px-2 py-1 text-center">Total</th>
        <th className="border w-[0.5rem] px-2 py-1 text-center"></th>
      </tr>
    </thead>
  );
}
