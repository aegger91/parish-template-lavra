/** Formats up to 10 digits as (000)-000-0000 while typing. */
export function maskPhone(input: string) {
  const d = input.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function isPhoneComplete(v: string) {
  return v.replace(/\D/g, "").length === 10;
}

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
