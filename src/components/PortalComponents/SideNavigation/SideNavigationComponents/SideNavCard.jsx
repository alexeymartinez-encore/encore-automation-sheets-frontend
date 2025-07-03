import { motion } from "framer-motion";

export default function SideNavCard({ children, isExpanded }) {
  return (
    <motion.div
      className="bg-white shadow-md flex flex-col items-center h-full"
      initial={{ width: "3rem" }}
      animate={{ width: isExpanded ? "15.625rem" : "3rem" }}
      transition={{ type: "tween", duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
