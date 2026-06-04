/** Pure formatting helpers shared by the domain narrative and the UI. */

// A fixed timezone is pinned so the server and client format dates identically
// (otherwise UTC-vs-local differences cause React hydration mismatches).
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});

const POUNDS = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export const formatLongDate = (isoTimestamp: string): string =>
  LONG_DATE.format(new Date(isoTimestamp));

export const formatShortDate = (isoTimestamp: string): string =>
  SHORT_DATE.format(new Date(isoTimestamp));

export const formatPounds = (amount: number): string => POUNDS.format(amount);

/** Joins a list into readable prose: ["a", "b", "c"] -> "a, b and c". */
export const joinWithAnd = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

export const pluralise = (count: number, singular: string, plural: string): string =>
  count === 1 ? singular : plural;
