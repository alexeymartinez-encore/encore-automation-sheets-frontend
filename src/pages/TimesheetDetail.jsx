import { useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";

export default function TimesheetDetail() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [timesheetEntriesData, setTimesheetEntriesData] = useState([]);
  const timesheetCtx = useContext(TimesheetContext);
  const adminMode = searchParams?.get("adminMode") === "true";
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const realId = params.timesheetId;

  useEffect(() => {
    async function fetchTimesheetEntriesData() {
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
      }
    }

    fetchTimesheetEntriesData();
  }, [baseUrl, realId, timesheetCtx.timesheets]);

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
