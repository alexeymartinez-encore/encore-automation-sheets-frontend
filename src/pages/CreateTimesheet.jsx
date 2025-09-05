import { useLocation } from "react-router-dom";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";

export default function CreateTimesheetPage() {
  const location = useLocation();
  const { prefillEntries } = location.state || {};
  return (
    <FormContainerCard>
      <TimesheetForm
        timesheetEntriesData={prefillEntries || []} // prefill if copying
        timesheetId={null} // always new
        isAdmin={false}
      />
    </FormContainerCard>
  );
}
