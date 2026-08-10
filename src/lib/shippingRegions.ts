// Central source of truth for country options in the checkout.
// No checkout component may hardcode its own country list.

export interface CountryOption {
  code: string;
  name: string;
}

// Dutch fallback names, used when Intl.DisplayNames is unavailable or has no entry.
const NL_NAMES: Record<string, string> = {
  AT: 'Oostenrijk', BE: 'België', BG: 'Bulgarije', CH: 'Zwitserland', CY: 'Cyprus',
  CZ: 'Tsjechië', DE: 'Duitsland', DK: 'Denemarken', EE: 'Estland', ES: 'Spanje',
  FI: 'Finland', FR: 'Frankrijk', GB: 'Verenigd Koninkrijk', GR: 'Griekenland',
  HR: 'Kroatië', HU: 'Hongarije', IE: 'Ierland', IS: 'IJsland', IT: 'Italië',
  LI: 'Liechtenstein', LT: 'Litouwen', LU: 'Luxemburg', LV: 'Letland', MT: 'Malta',
  NL: 'Nederland', NO: 'Noorwegen', PL: 'Polen', PT: 'Portugal', RO: 'Roemenië',
  SE: 'Zweden', SI: 'Slovenië', SK: 'Slowakije',
};

// Used only when the API reports `unrestricted: true` (or is unreachable).
export const DEFAULT_COUNTRY_CODES: string[] = Object.keys(NL_NAMES);

export function countryName(code: string, locale = 'nl'): string {
  const upper = (code || '').toUpperCase();
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    const name = dn.of(upper);
    if (name && name !== upper) return name;
  } catch {
    /* fall through to Dutch fallback */
  }
  return NL_NAMES[upper] || upper;
}

export function localizedCountryOptions(codes: string[], locale = 'nl'): CountryOption[] {
  const seen = new Set<string>();
  const options: CountryOption[] = [];
  for (const raw of codes || []) {
    const code = (raw || '').toUpperCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    options.push({ code, name: countryName(code, locale) });
  }
  return options.sort((a, b) => a.name.localeCompare(b.name, locale));
}
