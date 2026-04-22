const AUTH_ROUTE_ALLOWLIST = new Set([
  "/auth/login",
  "/auth/request-reset",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/verify",
  "/auth/logout",
]);

const UNSAFE_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let apiBaseUrl = "";
let unauthorizedHandler = null;
let refreshPromise = null;

function toAbsoluteUrl(input) {
  if (typeof input === "string") {
    return new URL(input, window.location.origin);
  }

  if (input instanceof URL) {
    return input;
  }

  return new URL(input.url, window.location.origin);
}

function getCookieValue(name) {
  const prefixedName = `${name}=`;
  const cookieParts = document.cookie.split(";");

  for (const part of cookieParts) {
    const trimmedPart = part.trim();
    if (trimmedPart.startsWith(prefixedName)) {
      return decodeURIComponent(trimmedPart.slice(prefixedName.length));
    }
  }

  return "";
}

function isApiRequest(urlObject) {
  if (!apiBaseUrl) {
    return true;
  }

  const absoluteBase = new URL(apiBaseUrl, window.location.origin);
  return urlObject.origin === absoluteBase.origin;
}

function shouldAttemptRefresh(urlObject) {
  return !AUTH_ROUTE_ALLOWLIST.has(urlObject.pathname);
}

function shouldAttachCsrfHeader(method) {
  return UNSAFE_HTTP_METHODS.has(String(method || "GET").toUpperCase());
}

function prepareRequestInit(init = {}) {
  const nextInit = { ...init };
  const method = String(nextInit.method || "GET").toUpperCase();
  const headers = new Headers(nextInit.headers || {});

  if (nextInit.credentials === undefined) {
    nextInit.credentials = "include";
  }

  if (shouldAttachCsrfHeader(method) && !headers.has("X-CSRF-Token")) {
    const csrfToken = getCookieValue("csrf_token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  nextInit.headers = headers;
  return nextInit;
}

async function performRefresh(baseFetch) {
  const headers = new Headers();
  const csrfToken = getCookieValue("csrf_token");
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const refreshUrl = apiBaseUrl
    ? `${apiBaseUrl}/auth/refresh`
    : "/auth/refresh";

  const response = await baseFetch(refreshUrl, {
    method: "POST",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }
}

async function ensureRefresh(baseFetch) {
  if (!refreshPromise) {
    refreshPromise = performRefresh(baseFetch).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function notifyUnauthorized() {
  if (typeof unauthorizedHandler === "function") {
    unauthorizedHandler();
  }
}

export function installApiClient(options = {}) {
  if (typeof window === "undefined") {
    return;
  }

  apiBaseUrl = options.baseUrl || apiBaseUrl || "";
  unauthorizedHandler = options.onUnauthorized || unauthorizedHandler;

  if (!window.__encoreOriginalFetch) {
    window.__encoreOriginalFetch = window.fetch.bind(window);
  }

  if (window.__encoreApiClientInstalled) {
    return;
  }

  const baseFetch = window.__encoreOriginalFetch;

  window.fetch = async (input, init = {}) => {
    const urlObject = toAbsoluteUrl(input);
    if (!isApiRequest(urlObject)) {
      return baseFetch(input, init);
    }

    const preparedInit = prepareRequestInit(init);
    let response = await baseFetch(input, preparedInit);

    if (
      response.status !== 401 ||
      !shouldAttemptRefresh(urlObject)
    ) {
      return response;
    }

    try {
      await ensureRefresh(baseFetch);
      response = await baseFetch(input, prepareRequestInit(init));
      if (response.status !== 401) {
        return response;
      }
    } catch (error) {
      // noop, handled by centralized unauthorized handler below
    }

    notifyUnauthorized();
    return response;
  };

  window.__encoreApiClientInstalled = true;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function readCsrfToken() {
  return getCookieValue("csrf_token");
}
