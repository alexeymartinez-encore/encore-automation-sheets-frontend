import { Outlet } from "react-router-dom";
import AdminNavBar from "../components/PortalComponents/AdminPage/AdminNav/AdminNavBar";

export default function AdminRootLayout() {
  return (
    <>
      <AdminNavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
