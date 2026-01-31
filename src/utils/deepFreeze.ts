/**
 * Recursively freezes an object to ensure it cannot be modified.
 * Essential for "Report Immutability" guardrails.
 */
export function deepFreeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}
