import AnalysisSection from "./AnalysisSection";
import ProfileSection from "./ProfileSection";
import TasksAndDeadlinesSection from "./TasksAndDeadlinesSection";

export default function PortalHome() {
  return (
    <div className="w-full  py-4 overflow-auto">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 h-full  ">
        <ProfileSection />
        <TasksAndDeadlinesSection />
        <div className="md:col-span-2">
          <AnalysisSection />
        </div>
      </div>
    </div>
  );
}
