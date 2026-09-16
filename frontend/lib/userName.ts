/**
 * Users who signed up by phone get an auto-generated name on the backend
 * ("მომხმარებელი 5027" — last 4 digits of the phone) until they enter a real
 * one. Use this to decide when to ask for / hide that placeholder.
 */
const PLACEHOLDER_NAME = /^მომხმარებელი \d{4}$/;

export function isPlaceholderName(name: string | null | undefined): boolean {
  return !name || PLACEHOLDER_NAME.test(name.trim());
}

/** Real name if the user has one, otherwise "" (for form prefills). */
export function realNameOrEmpty(name: string | null | undefined): string {
  return isPlaceholderName(name) ? "" : (name as string);
}

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

/** Client-side mirror of the backend rule: letters, spaces, hyphens, apostrophes. */
export function validateFullName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN_LENGTH) return "შეიყვანეთ სახელი და გვარი";
  if (name.length > NAME_MAX_LENGTH) return "სახელი ძალიან გრძელია";
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'’-]*$/u.test(name)) {
    return "სახელი შეიძლება შეიცავდეს მხოლოდ ასოებს";
  }
  return null;
}
