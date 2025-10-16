import { motion } from "framer-motion";

export default function SideNavCard({ children, isExpanded }) {
  return (
    <motion.div
      className="flex flex-row items-center justify-center shadow-xs"
      // initial={{ width: "screen" }}
      // animate={{ width: isExpanded ? "10.625rem" : "3rem" }}
      transition={{ type: "tween", duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
