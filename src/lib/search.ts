/**
 * Query normalisation for parts search: English, part numbers, car models and common
 * Roman-Urdu / misspelt terms ("brake ki pads", "batri", "redator").
 */
const SYNONYMS: Record<string, string> = {
  break: 'brake',
  brakes: 'brake',
  breaks: 'brake',
  pad: 'pads',
  batri: 'battery',
  battry: 'battery',
  bettery: 'battery',
  redator: 'radiator',
  radiater: 'radiator',
  filtar: 'filter',
  filters: 'filter',
  plugs: 'plug',
  sheesha: 'mirror',
  shisha: 'mirror',
  mirrors: 'mirror',
  jhatka: 'shock',
  shocks: 'shock',
  bulb: 'bulb',
  batti: 'light',
  lights: 'light',
  baja: 'horn',
  horns: 'horn',
  tail: 'tail',
  mobil: 'oil',
  oils: 'oil',
  pani: 'water',
  hawa: 'air',
  agla: 'front',
  aagay: 'front',
  peechay: 'rear',
  pichla: 'rear',
  wipers: 'wiper',
  vipers: 'wiper',
  coils: 'coil',
  bearings: 'bearing',
  mounts: 'mount',
  mounting: 'mount',
  bumpers: 'bumper',
  corola: 'corolla',
  carolla: 'corolla',
  civik: 'civic',
  sportge: 'sportage',
}

const STOPWORDS = new Set(['ki', 'ka', 'ke', 'ko', 'for', 'the', 'a', 'an', 'my', 'mera', 'meri', 'of', 'and', 'with', 'k', 'liye', 'wala', 'wali', 'car', 'gari', 'gaari'])

export function normalizeQuery(q: string): string[] {
  const tokens = q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
    .map((t) => SYNONYMS[t] ?? t)
  return [...new Set(tokens)].slice(0, 8)
}

/** Part numbers are matched with and without dashes/spaces: "04465-02220" ≈ "0446502220". */
export function compactPartNumber(token: string): string {
  return token.replace(/[\s\-.]/g, '')
}

export function looksLikePartNumber(token: string): boolean {
  return /\d/.test(token) && compactPartNumber(token).length >= 5
}
