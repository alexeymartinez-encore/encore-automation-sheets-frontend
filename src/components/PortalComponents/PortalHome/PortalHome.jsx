import AnalysisSection from "./AnalysisSection";
import OverdueTasksSection from "./OverdueTasksSection";
import ProfileSection from "./ProfileSection";
import UpcomingDeadlinesSection from "./UpcomingDeadlines";

export default function PortalHome() {
  return (
    <div className="w-full  py-4 overflow-auto">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 h-full  ">
        <ProfileSection />
        <AnalysisSection />
        <OverdueTasksSection />
        <UpcomingDeadlinesSection />
      </div>
    </div>
  );
}
