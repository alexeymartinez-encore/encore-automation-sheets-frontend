import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

export default function UserIcon({ onClick, isExpanded }) {
  return (
    <div className="p-2">
      <motion.button onClick={onClick} className="hidden text-white w-full ">
        <motion.div
        // animate={{ width: isExpanded ? "5rem" : "2rem" }}
        // transition={{ duration: 0.5, type: "tween" }}
        >
          <FontAwesomeIcon
            className={
              isExpanded
                ? "text-blue-500 h-[5rem] py-3"
                : "text-blue-500 h-[2rem] py-3"
            }
            icon={faCircleUser}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
