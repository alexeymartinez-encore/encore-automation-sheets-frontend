import { useParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";

export default function TimesheetDetail() {
  const params = useParams();
  const [timesheetEntriesData, setTimesheetEntriesData] = useState([]);
  const timesheetCtx = useContext(TimesheetContext);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchTimesheetEntriesData() {
      try {
        const response = await fetch(
          `${baseUrl}/timesheets/entries/${params.timesheetId}`,
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
  }, [timesheetCtx.timesheets]);
  // console.log(timesheetEntriesData, "ENTIREEES");

  return (
    <FormContainerCard>
      <TimesheetForm
        timesheetEntriesData={timesheetEntriesData}
        timesheetId={params.timesheetId}
      />
    </FormContainerCard>
  );
}
