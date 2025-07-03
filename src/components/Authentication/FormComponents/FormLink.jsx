import { Link } from "react-router-dom";

export default function FormLink({ children, to, text }) {
  return (
    <p className="text-sm">
      {text}
      <Link className="text-blue-500 text-sm my-2" to={to}>
        {children}
      </Link>
    </p>
  );
}
