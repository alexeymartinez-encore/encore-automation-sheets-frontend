import { motion } from "framer-motion";

function getUserInitials() {
  const firstName = (localStorage.getItem("first_name") || "").trim();
  const lastName = (localStorage.getItem("last_name") || "").trim();
  const userName = (localStorage.getItem("user_name") || "").trim();

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase()
      .trim() || "EP";
  }

  if (userName) {
    const parts = userName.split(/[.\s_-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  }

  return "EP";
}

export default function UserIcon({ onClick, isExpanded }) {
  const initials = getUserInitials();

  return (
    <div className="p-2">
      <motion.button onClick={onClick} className="text-white w-full py-4 px-2">
        <motion.div
          animate={{
            width: isExpanded ? "5rem" : "2rem",
            height: isExpanded ? "5rem" : "2rem",
          }}
          transition={{ duration: 0.5, type: "tween" }}
          className={`mx-auto rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center ${
            isExpanded ? "text-2xl" : "text-xs"
          }`}
        >
          {initials}
        </motion.div>
      </motion.button>
    </div>
  );
}
