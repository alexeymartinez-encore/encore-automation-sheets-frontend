export default function NavIconsCard({ children, padding, width }) {
  return (
    <div
      className={`flex flex-row items-start ${padding} text-white mb-0 gap-5 ${width}`}
    >
      {children}
    </div>
  );
}
