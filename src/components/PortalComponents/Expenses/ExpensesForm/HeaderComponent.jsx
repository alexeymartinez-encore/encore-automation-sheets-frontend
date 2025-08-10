export default function HeaderComponent() {
  return (
    <thead className="bg-blue-500 text-white text-xs">
      <tr>
        <th className="border w-[0rem] px-1 py-1 text-center">-</th>

        <th className="border w-[0rem] px-1 py-1 text-center">+</th>

        <th className="border w-[0rem] px-0 py-1 text-center">Day</th>
        <th className="border w-[3rem] px-0 py-1 text-center">Job</th>
        <th className="border w-[12rem] px-0 py-1 text-center">Purpose</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Travel</th>
        <th className="border w-[0rem] px-0 py-1 text-center">Lodging</th>
        <th className="border w-[0rem] px-1 py-1 text-center">
          Parking / Tolls / Gas
        </th>
        <th className="border w-[0rem] px-1 py-1 text-center">Car Rental</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Mileage</th>
        <th className="border w-[0rem] px-0 py-1 text-center">Perdiem</th>
        <th className="border w-[0rem] px-0 py-1 text-center">Entertainment</th>
        <th className="border w-[5rem] px-2 py-1 text-center">Miscellaneous</th>
        <th className="border w-[2rem]  text-center">Total</th>
        {/* <th className="border p-2 text-center"></th> */}
      </tr>
    </thead>
  );
}
