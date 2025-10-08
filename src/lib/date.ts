const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseISODateOnly(value: string): Date | null {
  if (typeof value !== "string" || !DATE_ONLY_REGEX.test(value)) {
    return null;
  }

  const [yearString, monthString, dayString] = value.split("-");
  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);
  const day = Number.parseInt(dayString, 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatISODateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeISODateOnly(value: string): string | null {
  const parsed = parseISODateOnly(value);

  if (!parsed) {
    return null;
  }

  return formatISODateOnly(parsed);
}

export function calculateAgeFromBirthDate(
  value: string,
  referenceDate: Date = new Date()
): number | null {
  const birthDate = parseISODateOnly(value);

  if (!birthDate) {
    return null;
  }

  const reference = new Date(referenceDate);
  let age = reference.getUTCFullYear() - birthDate.getUTCFullYear();

  const monthDifference = reference.getUTCMonth() - birthDate.getUTCMonth();
  const dayDifference = reference.getUTCDate() - birthDate.getUTCDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1;
  }

  return age;
}
