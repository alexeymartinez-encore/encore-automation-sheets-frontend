export default function TableHeader() {
  return (
    <div className="grid grid-cols-6 md:grid-cols-9 p-3 border-b bg-blue-500 text-white rounded-md text-[0.5rem] md:text-[0.7rem] shadow-sm">
      <p className="text-left">Last</p>
      <p className="text-left">First</p>
      <p className="text-start md:text-center  md:block">Signed</p>
      <p className="text-center hidden md:block">Approved</p>
      <p className="text-start md:text-center md:hidden block">Appr</p>
      <p className="text-center hidden md:block">Paid</p>
      <p className="text-center  hidden md:block">Sign By</p>
      <p className="text-center hidden md:block">Reg</p>
      <p className="text-center">OT</p>
      <p className="text-center">Total</p>
    </div>
  );
}
