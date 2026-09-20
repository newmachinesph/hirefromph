// Static brand paths for next/og (no CSS variables in Satori).
const NAVY = "#043882";
const GOLD = "#FCC449";
const CREAM = "#FEFBF5";

/** The mark, same paths as `public/brand/mark.svg`. */
export function BrandMark({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 256 256" fill="none" style={{ display: "flex" }}>
      <rect width="256" height="256" rx="56" fill={NAVY} />
      <path
        fill={CREAM}
        d="M62 62h30c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30H62c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30z"
      />
      <path
        fill={CREAM}
        d="M164 62h30c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30h-30c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30z"
      />
      <path stroke={NAVY} strokeWidth="5" strokeLinecap="round" d="M62 98q15 4 30 0M62 134q15 4 30 0M62 170q15 4 30 0" />
      <path stroke={NAVY} strokeWidth="5" strokeLinecap="round" d="M164 98q15 4 30 0M164 134q15 4 30 0M164 170q15 4 30 0" />
      <path d="M92 130c20-22 52-22 72 0v18c-20-20-52-20-72 0z" fill={GOLD} />
      <path fill={GOLD} d="M60 86c-14-8-22-14-24-26 12 2 20 10 26 22z" />
      <path fill={GOLD} d="M60 110c-8-4-14-8-16-16 8 2 12 6 16 14z" />
      <path fill={GOLD} d="M196 86c14-8 22-14 24-26-12 2-20 10-26 22z" />
      <path fill={GOLD} d="M196 110c8-4 14-8 16-16-8 2-12 6-16 14z" />
    </svg>
  );
}
