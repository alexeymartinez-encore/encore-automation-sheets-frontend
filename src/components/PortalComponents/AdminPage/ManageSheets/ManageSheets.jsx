import { useState } from "react";
import ManageExpensesTable from "./ManageExpenses/ManageExpensesTable";
import ManageTimesheetsTable from "./ManageTimesheets/ManageTimesheetsTable";
import OvertimeModalComponent from "./OvertimeModal/OvertimeModalComponent";

export default function ManageSheets() {
  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    setShowModal((prev) => !prev);
  }
  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 my-5">
        <ManageTimesheetsTable onViewOvertime={toggleModal} />
        <hr className="my-5 md:my-0 md:hidden" />
        <ManageExpensesTable />
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
