import { redirect } from "react-router";

export function checkIfAdmin() {
  const role = localStorage.getItem("role_id");
  if (role !== "3") {
    return redirect("/employee-portal/dashboard");
  } else {
    return null;
  }
}

export function checkIfManager() {
  const role = localStorage.getItem("role_id");
  if (role !== "2") {
    return redirect("/employee-portal/dashboard");
  } else {
    return null;
  }
}
