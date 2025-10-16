export default function TableHeader() {
  return (
    <div className="grid grid-cols-5 md:grid-cols-9   p-3 border-b bg-blue-500 text-white rounded-md text-[0.5rem] md:text-[0.7rem] shadow-sm">
      <p className="flex-1 text-left">Last</p>
      <p className="flex-1 text-left">First</p>
      {/* <p className="flex-1 text-center">Start Date</p> */}
      <p className="flex-1 text-center hidden md:block">Days</p>
      <p className="flex-1 text-center hidden md:block">Signed</p>
      <p className="flex-1 text-center md:hidden block">Sign</p>

      <p className="flex-1 text-center hidden md:block">Approved</p>
      <p className="flex-1 text-center md:hidden block">Appr</p>
      <p className="flex-1 text-center hidden md:block">Paid</p>
      <p className="flex-1 text-center hidden md:block">Signed By</p>
      {/* <p className="flex-1 text-center  block justify-center">By</p> */}
      <p className="flex-1 text-center hidden md:block">Paid on</p>
      <p className="flex-1 text-center">Total</p>
    </div>
  );
}
