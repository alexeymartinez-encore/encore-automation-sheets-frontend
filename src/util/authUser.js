export function getAuthUserId(user) {
  const rawId = user?.user_id ?? user?.id;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getAuthUserName(user) {
  const rawName = user?.user_name;
  return typeof rawName === "string" ? rawName.trim() : "";
}

export function getAuthUserRoleId(user) {
  const parsed = Number(user?.role_id);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isUserOvertimeAllowed(user) {
  return user?.allow_overtime === true || user?.allow_overtime === "true";
}
