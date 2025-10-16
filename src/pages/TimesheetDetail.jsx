import { useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import FormContainerCard from "../components/PortalComponents/Shared/FormContainerCard";
import TimesheetForm from "../components/PortalComponents/TimeSheets/TimesheetForm";
import { encode, decode } from "js-base64";

export default function TimesheetDetail() {
  const params = useParams();
  const [searchParams] = useSearchParams(); // gets query params like adminMode=true

  const [timesheetEntriesData, setTimesheetEntriesData] = useState([]);
  const timesheetCtx = useContext(TimesheetContext);
  const adminMode = searchParams?.get("adminMode") === "true"; // boolean
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const realId = params.timesheetId; // e.g. "4002"
  const encodedId = encode(realId); // e.g. "NDAwMg=="

  // Replace the visible URL after mount
  useEffect(() => {
    const newUrl = `/employee-portal/dashboard/timesheets/${encodedId}${
      adminMode ? "?adminMode=true" : ""
    }`;

    // Replace only the visible URL — doesn’t trigger navigation
    window.history.replaceState(null, "", newUrl);
  }, [encodedId, adminMode]);

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
  }, [timesheetCtx.timesheets]);

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
