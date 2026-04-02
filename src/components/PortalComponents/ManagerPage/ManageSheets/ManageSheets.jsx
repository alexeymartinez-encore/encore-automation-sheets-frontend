import { useContext, useEffect, useState } from "react";
import ManageExpensesTable from "./ManageExpenses/ManageExpensesTable";
import ManageTimesheetsTable from "./ManageTimesheets/ManageTimesheetsTable";
import OvertimeModalComponent from "./OvertimeModal/OvertimeModalComponent";
import { AdminContext } from "../../../../store/admin-context";
import AdminQuickCreateMenu from "../../AdminPage/ManageSheets/ManageSheetsShared/AdminQuickCreateMenu";

export default function ManageSheets() {
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const adminCtx = useContext(AdminContext);

  useEffect(() => {
    async function loadManagedEmployees() {
      setIsEmployeesLoading(true);
      try {
        const fetchedEmployees = await adminCtx.getAllEmployees();
        const activeEmployees = (fetchedEmployees || []).filter(
          (employee) => employee.is_active
        );
        setEmployees(activeEmployees);
      } finally {
        setIsEmployeesLoading(false);
      }
    }

    loadManagedEmployees();
  }, [adminCtx]);

  function toggleModal() {
    setShowModal((prev) => !prev);
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
            allowedRecordTypes={["timesheet", "expense"]}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <ManageTimesheetsTable
            onViewOvertime={toggleModal}
            refreshToken={refreshToken}
          />
          <hr className="my-5 md:my-0 md:hidden" />
          <ManageExpensesTable refreshToken={refreshToken} />
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={toggleModal}
        >
          <OvertimeModalComponent />
        </div>
      )}
    </>
  );
}
