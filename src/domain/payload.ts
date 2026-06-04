/**
 * Event payloads are `Record<string, unknown>` (their shape varies by event
 * type). These tiny readers pull typed values out safely so the derivation code
 * never sprinkles `as` casts around.
 */

type Payload = Record<string, unknown>;

export const readString = (payload: Payload, key: string): string | undefined => {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
};

export const readNumber = (payload: Payload, key: string): number | undefined => {
  const value = payload[key];
  return typeof value === "number" ? value : undefined;
};

export const readStringArray = (payload: Payload, key: string): string[] => {
  const value = payload[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
};
