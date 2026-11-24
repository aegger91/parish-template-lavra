const map: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i',
  ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

/** Serbian Cyrillic to Serbian Latin (gajica). Non-Cyrillic text passes through. */
export function toLatin(input: string): string {
  let out = '';
  const chars = [...input];
  chars.forEach((ch, i) => {
    const lower = ch.toLowerCase();
    const latin = map[lower];
    if (latin === undefined) {
      out += ch;
      return;
    }
    if (ch === lower) {
      out += latin;
      return;
    }
    const next = chars[i + 1];
    const nextIsUpper = next !== undefined && next !== next.toLowerCase();
    out += nextIsUpper ? latin.toUpperCase() : latin.charAt(0).toUpperCase() + latin.slice(1);
  });
  return out;
}
