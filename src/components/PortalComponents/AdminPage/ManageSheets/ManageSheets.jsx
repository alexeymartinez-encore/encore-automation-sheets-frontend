import { useState } from "react";
import ManageExpensesTable from "./ManageExpenses/ManageExpensesTable";
import ManageTimesheetsTable from "./ManageTimesheets/ManageTimesheetsTable";
import OvertimeModalComponent from "./OvertimeModal/OvertimeModalComponent";
import VacationReportModal from "./OvertimeModal/VacationReportModal";
import BereavementReportModal from "./OvertimeModal/BereavementReportModal";
import JuryDutyReportModal from "./OvertimeModal/JuryDutyReportModal";
import SickReportModal from "./OvertimeModal/SickReportModal";

export default function ManageSheets() {
  const [activeReport, setActiveReport] = useState(null);

  function openReportModal(type) {
    setActiveReport(type);
  }

  function closeReportModal() {
    setActiveReport(null);
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 my-5">
        <ManageTimesheetsTable openReportModal={openReportModal} />
        <hr className="my-5 md:my-0 md:hidden" />
        <ManageExpensesTable />
      </div>

      {/* Render modals based on activeReport */}
      {activeReport === "overtime" && (
        <OvertimeModalComponent onClose={closeReportModal} />
      )}
      {activeReport === "labor" && (
        <OvertimeModalComponent onClose={closeReportModal} />
      )}
      {activeReport === "vacation" && (
        <VacationReportModal onClose={closeReportModal} />
      )}
      {activeReport === "sick" && (
        <SickReportModal onClose={closeReportModal} />
      )}
      {activeReport === "bereavement" && (
        <BereavementReportModal onClose={closeReportModal} />
      )}
      {activeReport === "juryduty" && (
        <JuryDutyReportModal onClose={closeReportModal} />
      )}
      {/* Add more here:
          {activeReport === "sick" && <SickReportModal onClose={closeReportModal} />}
      */}
    </>
  );
}
