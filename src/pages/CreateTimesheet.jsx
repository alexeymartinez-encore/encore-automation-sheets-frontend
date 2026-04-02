import { useLocation } from "react-router-dom";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";

export default function CreateTimesheetPage() {
  const location = useLocation();
  const { prefillEntries, prefillDate, adminCreate } = location.state || {};
  const initialEmployee = adminCreate?.employeeId
    ? {
        id: adminCreate.employeeId,
        first_name: adminCreate.first_name || "",
        last_name: adminCreate.last_name || "",
      }
    : null;

  return (
    <FormContainerCard>
      <TimesheetForm
        timesheetEntriesData={prefillEntries} // prefill if copying
        initialSelectedDate={prefillDate}
        timesheetId={null} // always new
        isAdmin={Boolean(initialEmployee?.id)}
        initialEmployee={initialEmployee}
      />
    </FormContainerCard>
  );
}
