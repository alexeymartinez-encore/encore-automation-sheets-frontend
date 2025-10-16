export default function TableHeader() {
  return (
    <div className="grid grid-cols-5 md:grid-cols-9 p-3 border-b bg-blue-500 text-white rounded-md text-[0.5rem] md:text-[0.7rem] shadow-sm">
      <p className="flex-1 text-left">Last</p>
      <p className="flex-1 text-left">First</p>
      {/* <p className="flex-1 text-center hidden md:flex">Comment</p> */}
      <p className="flex-1 text-center  md:block">Signed</p>
      {/* <p className="flex-1 text-center md:hidden flex">Sign</p> */}
      <p className="flex-1 text-center hidden md:block">Approved</p>
      <p className="flex-1 text-center md:hidden block">Appr</p>
      <p className="flex-1 text-center hidden md:block">Paid</p>
      <p className="flex-1 text-center  hidden md:block">Sign By</p>
      {/* <p className="flex-1 text-center  md:hidden flex justify-center">By</p> */}
      {/* <p className="flex-1 text-center hidden md:block">Paid On</p> */}
      <p className="flex-1 text-center hidden md:block">Reg</p>
      <p className="flex-1 text-center hidden md:block">OT</p>
      <p className="flex-1 text-center">Total</p>
    </div>
  );
}
