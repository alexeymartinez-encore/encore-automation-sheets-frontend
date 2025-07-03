import { useAnimation, motion } from "framer-motion";
import ActionCard from "./ActionCard";
import {
  faRightToBracket,
  faBook,
  faVideo,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
export default function EmployeeActions() {
  const controls = useAnimation();
  const { ref, inView } = useInView({ threshold: 0.2 });

  const variant = {
    hidden: { opacity: 0, y: 200 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={controls}
      transition={{ duration: 1, type: "spring", stiffness: 50 }}
      className="flex flex-row m-20 justify-between flex-wrap"
    >
      <ActionCard
        title="Personal Portal"
        subtitle="Link to Timesheet"
        icon={faRightToBracket}
        link="login"
      />
      <ActionCard
        title="Webmail"
        subtitle="Link to webmail"
        icon={faArrowUpRightFromSquare}
        link="https://cp.intermedia.net/ControlPanel/Login?ClientType=WebMail"
      />
      <ActionCard
        title="Shop Cameras"
        subtitle="Link to cameras"
        icon={faVideo}
      />
      <ActionCard
        title="Employee Handbook"
        subtitle=" Link to Handbook"
        icon={faBook}
        link="https://encoreautomation.com/wp-content/uploads/2019/04/EmployeeHandBook.pdf"
      />
    </motion.div>
  );
}
