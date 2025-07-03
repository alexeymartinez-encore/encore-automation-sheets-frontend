export default function SubheaderComponent() {
  return (
    <thead className="bg-blue-500 text-white text-xs">
      <tr>
        <th className="border w-[0rem] px-0 py-1 text-center"></th>
        <th className="border w-[0rem] px-0 py-1 text-center"></th>
        <th className="border w-[3rem] px-0 py-1 text-center"></th>
        <th className="border w-[10rem] px-0 py-1 text-center"></th>
        <th className="border w-[5rem] px-2 py-1 text-center">
          <div className="flex  justify-around gap-5 font-light">
            <p>To/From</p>
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center">
          <div className="flex justify-center gap-5 font-light">
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center">
          <div className="flex justify-center gap-5 font-light">
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center">
          <div className="flex justify-center gap-5 font-light">
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[5rem] px-2 py-1 text-center">
          <div className="flex  justify-around gap-5 font-light">
            <p>Miles</p>
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[0rem]  py-1 text-center">
          <div className="flex justify-center gap-5 font-light">
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[0rem] py-1 text-center">
          <div className="flex justify-center gap-0 font-light">
            <p>Amount</p>
          </div>
        </th>
        <th className="border px-2 py-1 text-center">
          <div className="flex justify-around gap-5 font-light">
            <p>Description</p>
            <p>Amount</p>
          </div>
        </th>
        <th className="border w-[1rem] px-2 py-1 text-center"></th>
        {/* <th className="border p-2 text-center"></th> */}
      </tr>
    </thead>
  );
}
