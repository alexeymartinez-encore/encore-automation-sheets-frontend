export default function NavIconsCard({ children, padding, width }) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 ${padding} text-white gap-5 ${width}`}
    >
      {children}
    </div>
  );
}

{
  /* <div className="flex flex-col items-center p-1 text-white mb-20 gap-5"></div> */
}
