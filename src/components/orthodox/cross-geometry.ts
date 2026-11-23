/*
  Single source of truth for every cross drawn by this template,
  used by the <Cross> component and by scripts/generate-art.mts.

  slavic: eight-pointed cross. The slanted footrest rises to the viewer's LEFT.
  byzantine: equal-armed cross with flared ends (Serbian and Romanian usage).
*/

export type CrossVariant = "slavic" | "byzantine";

export const CROSS_GEOMETRY: Record<CrossVariant, { width: number; height: number; d: string }> = {
  slavic: {
    width: 24,
    height: 40,
    d: [
      "M10.6 0.5H13.4V39.5H10.6Z",
      "M7.4 4.6H16.6V7.2H7.4Z",
      "M1.5 11.2H22.5V14.2H1.5Z",
      // footrest: left end (x 5.2) sits higher than the right end (x 18.8)
      "M5.2 27.2L18.8 31.6V34.4L5.2 30Z",
    ].join(" "),
  },
  byzantine: {
    width: 40,
    height: 40,
    d: "M17.5 16L13 2.5H27L22.5 16L37.5 13V27L22.5 24L27 37.5H13L17.5 24L2.5 27V13Z",
  },
};

/** Returns SVG markup for a cross placed with its top-left at (x, y), scaled to the given height. */
export function crossSvg(variant: CrossVariant, x: number, y: number, height: number, fill: string, extra = "") {
  const g = CROSS_GEOMETRY[variant];
  const s = height / g.height;
  return `<path d="${g.d}" fill="${fill}" transform="translate(${x} ${y}) scale(${s})" ${extra}/>`;
}
