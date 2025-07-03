import { motion } from "framer-motion";

export default function SuccessUI({ status, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -200 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -200 }} // Add exit animation
      transition={{
        delay: 0,
        duration: 0.3,
        type: "spring",
        stiffness: 20,
      }}
      className={`absolute ${status === "success" && "bg-green-400"} ${
        status === "fail" && "bg-red-400"
      } text-white py-2 w-screen text-center bg-opacity-90
                 rounded-bl-md rounded-br-md font-light z-50`}
    >
      {message}
    </motion.div>
  );
}
