export default function ExpensesHeader() {
  return (
    <div className="flex flex-row gap-10 md:gap-0 justify-between p-3 border-b bg-blue-500 text-white rounded-md text-sm  items-center">
      <p className="flex-1 text-center">Month</p>
      {/* <p className="hidden md:block flex-1 text-center">Days</p> */}
      <p className="hidden md:block flex-1 text-center">Signed</p>
      <p className="hidden md:block flex-1 text-center">Approved</p>
      <p className="hidden md:block flex-1 text-center">Paid</p>
      <p className="hidden md:block flex-1 text-center">Signed By</p>
      <p className=" hidden md:blockflex-1 text-center">Date Paid</p>
      <p className="flex-1 text-center">Total</p>
      <p className="flex-1 text-center my-1 md:my-0">-</p>
    </div>
  );
}
