export default function NavIconsCard({ children, padding, width }) {
  return (
    <div
      className={`flex items-center justify-between flex-row   ${padding} text-white mb-0  w-full ${width}`}
    >
      {children}
    </div>
  );
}
