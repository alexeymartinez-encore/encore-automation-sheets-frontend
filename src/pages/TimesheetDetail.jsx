import { useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";
import LoadingState from "../components/PortalComponents/Shared/LoadingState";

export default function TimesheetDetail() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [timesheetEntriesData, setTimesheetEntriesData] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const timesheetCtx = useContext(TimesheetContext);
  const adminMode = searchParams?.get("adminMode") === "true";
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const realId = params.timesheetId;

  useEffect(() => {
    async function fetchTimesheetEntriesData() {
      setIsLoadingEntries(true);
      try {
        const response = await fetch(
          `${baseUrl}/timesheets/entries/${realId}`,
          {
            headers: {
              // Authorization: "Bearer " + token,
            },
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.log("Something went wrong");
          return;
        }
        setTimesheetEntriesData(data.data);
      } catch (error) {
        console.error("Error during fetching projects:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    }

    fetchTimesheetEntriesData();
  }, [baseUrl, realId, timesheetCtx.timesheets]);

  if (isLoadingEntries) {
    return (
      <FormContainerCard>
        <LoadingState label="Loading timesheet details..." />
      </FormContainerCard>
    );
  }

  return (
    <FormContainerCard>
      <TimesheetForm
        timesheetEntriesData={timesheetEntriesData}
        timesheetId={realId}
        isAdmin={adminMode}
      />
    </FormContainerCard>
  );
}
