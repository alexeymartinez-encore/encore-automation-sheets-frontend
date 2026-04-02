export default function FormHeaderMobile() {
  return (
    <thead className="bg-blue-500 text-white text-[0.62rem]">
      <tr>
        <th className="border w-[2.2rem] px-1 py-1 text-center">Edit</th>
        <th className="border w-[1.8rem] px-1 py-1 text-center">-</th>
        <th className="border w-[1.8rem] px-1 py-1 text-center">+</th>
        <th className="border w-[2.4rem] px-1 py-1 text-center">Day</th>
        <th className="border px-2 py-1 text-center">Project</th>
        <th className="border w-[4.6rem] px-1 py-1 text-center">Total</th>
      </tr>
    </thead>
  );
}
