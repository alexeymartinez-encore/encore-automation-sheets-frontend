import { useContext, useEffect, useState } from "react";
import ManageExpensesTable from "./ManageExpenses/ManageExpensesTable";
import ManageTimesheetsTable from "./ManageTimesheets/ManageTimesheetsTable";
import OvertimeModalComponent from "./OvertimeModal/OvertimeModalComponent";
import VacationReportModal from "./OvertimeModal/VacationReportModal";
import BereavementReportModal from "./OvertimeModal/BereavementReportModal";
import JuryDutyReportModal from "./OvertimeModal/JuryDutyReportModal";
import SickReportModal from "./OvertimeModal/SickReportModal";
import { AdminContext } from "../../../../store/admin-context";
import AdminQuickCreateMenu from "./ManageSheetsShared/AdminQuickCreateMenu";

export default function ManageSheets() {
  const [activeReport, setActiveReport] = useState(null);
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const adminCtx = useContext(AdminContext);

  useEffect(() => {
    async function loadActiveEmployees() {
      setIsEmployeesLoading(true);
      try {
        const fetchedEmployees = await adminCtx.getAllEmployees();
        const activeEmployees = (fetchedEmployees || []).filter(
          (employee) => employee.is_active
        );
        setEmployees(activeEmployees);
        setActiveEmployeeCount(activeEmployees.length);
      } finally {
        setIsEmployeesLoading(false);
      }
    }

    loadActiveEmployees();
  }, [adminCtx]);

  function openReportModal(type) {
    setActiveReport(type);
  }

  function closeReportModal() {
    setActiveReport(null);
  }

  function handleRecordCreated() {
    setRefreshToken((currentValue) => currentValue + 1);
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <AdminQuickCreateMenu
            employees={employees}
            isLoading={isEmployeesLoading}
            onCreated={handleRecordCreated}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <ManageTimesheetsTable
            openReportModal={openReportModal}
            activeEmployeeCount={activeEmployeeCount}
            refreshToken={refreshToken}
          />
          <hr className="my-5 md:my-0 md:hidden" />
          <ManageExpensesTable
            activeEmployeeCount={activeEmployeeCount}
            refreshToken={refreshToken}
          />
        </div>
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
