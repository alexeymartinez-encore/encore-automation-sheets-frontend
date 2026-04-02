const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/;
const US_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function formatDateParts(year, month, day) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`;
}

function isMidnight(hours, minutes, seconds, milliseconds) {
  return (
    hours === 0 &&
    minutes === 0 &&
    seconds === 0 &&
    milliseconds === 0
  );
}

function formatDateObject(date) {
  const shouldPreferUtc =
    isMidnight(
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    ) &&
    !isMidnight(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );

  if (shouldPreferUtc) {
    return formatDateParts(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    );
  }

  return formatDateParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

export function toDateOnly(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    const isoMatch = trimmed.match(ISO_DATE_PATTERN);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    const usMatch = trimmed.match(US_DATE_PATTERN);
    if (usMatch) {
      return `${usMatch[3]}-${usMatch[1]}-${usMatch[2]}`;
    }

    value = /^\d{4}-\d{2}-\d{2} /.test(trimmed)
      ? trimmed.replace(" ", "T")
      : trimmed;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return formatDateObject(parsed);
}

export function addDaysToDateOnly(value, days) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "";

  const [year, month, day] = dateOnly.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  parsed.setUTCDate(parsed.getUTCDate() + days);

  return formatDateParts(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth() + 1,
    parsed.getUTCDate()
  );
}

export function startOfMonthDateOnly(value) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "";

  const [year, month] = dateOnly.split("-");
  return `${year}-${month}-01`;
}

export function endOfMonthDateOnly(value) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "";

  const [year, month] = dateOnly.split("-");
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0))
    .getUTCDate()
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${lastDay}`;
}

export function toMonthStartDate(value) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return null;

  const [year, month] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}
