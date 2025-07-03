export default function NavIconsCard({ children, padding, width }) {
  return (
    <div
      className={`flex flex-col items-start ${padding} text-white mb-20 gap-5 ${width}`}
    >
      {children}
    </div>
  );
}

{
  /* <div className="flex flex-col items-center p-1 text-white mb-20 gap-5"></div> */
}
