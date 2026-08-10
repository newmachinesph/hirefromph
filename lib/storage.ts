/**
 * One-time rename of a localStorage key. Used by the DevUp → Hire From PH
 * rebrand: three keys hold user data, one of them the resume/portfolio/SOP
 * prose the user wrote themselves, so a silent wipe is not acceptable.
 *
 * The value moves as an opaque string. Validation stays in each consumer's
 * existing load path, which already tolerates bad JSON — parsing here would
 * mean three shapes to validate and a second place for that logic to rot.
 */
export function migrateKey(oldKey: string, newKey: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem(newKey) !== null) return;
    const old = localStorage.getItem(oldKey);
    if (old === null) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
    // Quota, private mode, or a blocked-storage SecurityError. A failed
    // migration must never break page render.
  }
}
