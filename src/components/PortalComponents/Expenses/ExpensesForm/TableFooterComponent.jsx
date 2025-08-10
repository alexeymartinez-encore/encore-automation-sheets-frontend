export default function TableFooterComponent({ totals }) {
  return (
    <thead className="bg-blue-500 text-white text-xs">
      <tr>
        <th className="border w-[0rem] px-0 py-1 text-center"></th>

        <th className="border w-[0rem] px-0 py-1 text-center"></th>

        <th className="border w-[0rem] px-0 py-1 text-center"></th>
        <th className="border w-[0rem] px-0 py-1 text-center"></th>
        <th className="border w-[10rem] px-0 py-1 text-center"></th>
        <th className="border w-[5rem] px-2 py-1 text-center  font-thin">
          {totals.destination_cost.toFixed(2)}
        </th>
        <th className="border w-[0rem] px-2 py-1 text-center  font-thin">
          {totals.lodging_cost.toFixed(2)}
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center  font-thin">
          {totals.other_expense_cost.toFixed(2)}
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center  font-thin">
          {totals.car_rental_cost.toFixed(2)}
        </th>
        <th className="border w-[5rem] px-2 py-1 text-center  font-thin">
          {totals.miles_cost.toFixed(2)}
        </th>
        <th className="border w-[0rem] py-1 text-center  font-thin">
          {" "}
          {totals.perdiem_cost.toFixed(2)}
        </th>
        <th className="border w-[0rem] px-0 py-1 text-center  font-thin">
          {totals.entertainment_cost.toFixed(2)}
        </th>
        <th className="border w-[5rem] px-2 py-1 text-center  font-thin">
          {totals.miscellaneous_amount.toFixed(2)}
        </th>
        <th className="border w-[2rem] text-center  font-thin">
          {totals.grand_total.toFixed(2)}
        </th>
      </tr>
    </thead>
  );
}
