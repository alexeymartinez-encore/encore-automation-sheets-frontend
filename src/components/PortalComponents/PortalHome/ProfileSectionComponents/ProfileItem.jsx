export default function ProfileItem({ desc, children }) {
  return (
    <div className="flex border-b p-3 justify-between">
      <p>{desc}</p>
      <p className="font-thin">{children}</p>
    </div>
  );
}
