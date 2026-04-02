const USER_KEY_MAP = Object.freeze({
  userId: "id",
  user_id: "user_id",
  user_name: "user_name",
  first_name: "first_name",
  last_name: "last_name",
  employee_number: "employee_number",
  home_phone: "home_phone",
  cell_phone: "cell_phone",
  email: "email",
  role_id: "role_id",
  manager_id: "manager_id",
  position: "position",
  manager_name: "manager_name",
  allow_overtime: "allow_overtime",
  is_active: "is_active",
  is_contractor: "is_contractor",
});

let sessionUser = null;
let totalEmployees = null;
let bridgeInstalled = false;

function hasManagedKey(key) {
  return key === "total_employees" || Object.hasOwn(USER_KEY_MAP, key);
}

function normalizeStorageValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function setSessionSnapshot(payload = {}) {
  if (payload.user !== undefined) {
    sessionUser = payload.user || null;
  }

  if (payload.totalEmployees !== undefined) {
    totalEmployees =
      payload.totalEmployees === null ? null : Number(payload.totalEmployees);
  }
}

export function clearSessionSnapshot() {
  sessionUser = null;
  totalEmployees = null;
}

export function getSessionUser() {
  return sessionUser;
}

export function getSessionStorageValue(key) {
  if (key === "total_employees") {
    return normalizeStorageValue(totalEmployees);
  }

  const mappedField = USER_KEY_MAP[key];
  if (!mappedField) {
    return null;
  }

  const value = sessionUser?.[mappedField];
  return normalizeStorageValue(value);
}

export function installSessionStorageBridge() {
  if (bridgeInstalled || typeof window === "undefined") {
    return;
  }

  const storage = window.localStorage;
  const originalGetItem = storage.getItem.bind(storage);
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);

  storage.getItem = (key) => {
    if (hasManagedKey(key)) {
      return getSessionStorageValue(key);
    }

    return originalGetItem(key);
  };

  storage.setItem = (key, value) => {
    if (hasManagedKey(key)) {
      return;
    }

    return originalSetItem(key, value);
  };

  storage.removeItem = (key) => {
    if (hasManagedKey(key)) {
      return;
    }

    return originalRemoveItem(key);
  };

  bridgeInstalled = true;
}
