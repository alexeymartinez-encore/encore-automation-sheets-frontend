import { redirect } from "react-router";
import { getSessionUser } from "../store/session-store";
import { getAuthUserRoleId } from "./authUser";

function getSessionRoleId() {
  return getAuthUserRoleId(getSessionUser());
}

export function checkIfAdmin() {
  if (getSessionRoleId() !== 3) {
    return redirect("/employee-portal/dashboard");
  } else {
    return null;
  }
}

export function checkIfManager() {
  if (getSessionRoleId() !== 2) {
    return redirect("/employee-portal/dashboard");
  } else {
    return null;
  }
}
