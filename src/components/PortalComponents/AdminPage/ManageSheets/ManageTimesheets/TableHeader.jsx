export default function TableHeader() {
  return (
    <div className="flex justify-between p-3 border-b bg-blue-500 text-white rounded-md text-[0.5rem] md:text-[0.7rem] shadow-sm">
      <p className="flex-1 text-center">Last</p>
      <p className="flex-1 text-center">First</p>
      <p className="flex-1 text-center hidden md:flex">Comment</p>
      <p className="flex-1 text-center hidden md:flex">Signed</p>
      <p className="flex-1 text-center md:hidden flex">Sign</p>
      <p className="flex-1 text-center hidden md:flex">Approved</p>
      <p className="flex-1 text-center md:hidden flex">Appr</p>
      <p className="flex-1 text-center">Paid</p>
      <p className="flex-1 text-center  hidden md:flex">Signed By</p>
      <p className="flex-1 text-center  md:hidden flex justify-center">By</p>
      <p className="flex-1 text-center hidden md:flex">Date Paid</p>
      <p className="flex-1 text-center">Reg</p>
      <p className="flex-1 text-center">OT</p>
      <p className="flex-1 text-center">Total</p>
    </div>
  );
}
