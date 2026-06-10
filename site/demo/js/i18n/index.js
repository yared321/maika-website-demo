/**
 * Lightweight i18n for the static demo: central strings + DOM binding.
 *
 * HTML:  <button data-i18n="landing.access.cta">Try Demo</button>
 *        <select data-i18n-aria-label="landing.access.genreAria">…</select>
 *        <meta data-i18n-content="meta.description" content="…" />
 *
 * JS:    import { t } from "./i18n/index.js";
 *        setLandingError(dom, t("errors.consentRequired"));
 */
import en from "./strings/en.js";

/**
 * Default demo language when nothing is stored in session.
 * @type {"en" | "nl" | "de"}
 */
export const DEMO_LOCALE = "de";

/** Locales shown in the header language picker. */
export const UI_LOCALES = Object.freeze(["de", "en"]);

const LOCALE_STORAGE_KEY = "maika-demo-locale";

const localeLoaders = {
  en: () => Promise.resolve(en),
  nl: () => import("./strings/nl.js").then((mod) => mod.default),
  de: () => import("./strings/de.js").then((mod) => mod.default),
};

/** @type {readonly string[]} */
export const supportedLocales = Object.freeze(Object.keys(localeLoaders));

let activeLocale = "en";
/** @type {Record<string, unknown>} */
let catalog = en;

/**
 * @param {string} path Dot-separated key path (e.g. "landing.access.cta").
 * @param {Record<string, string | number>} [vars] Interpolation values for `{name}` placeholders.
 * @returns {string}
 */
export function t(path, vars) {
  const value = resolvePath(catalog, path);
  if (typeof value !== "string") return path;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v == null ? `{${key}}` : String(v);
  });
}

export function getLocale() {
  return activeLocale;
}

/** @param {string} code */
function isUiLocale(code) {
  return UI_LOCALES.includes(String(code || "").toLowerCase());
}

/** @returns {string} */
export function resolveLocale() {
  try {
    const stored = sessionStorage.getItem(LOCALE_STORAGE_KEY);
    if (isUiLocale(stored)) return stored;
  } catch (_error) {
    /* sessionStorage unavailable */
  }
  return isUiLocale(DEMO_LOCALE) ? DEMO_LOCALE : "de";
}

/**
 * Load a locale catalog and apply strings to the DOM.
 * @param {string} [locale]
 * @param {ParentNode} [root]
 */
export async function initI18n(locale = "de", root = document) {
  const code = isUiLocale(locale) ? String(locale).toLowerCase() : "de";
  catalog = await localeLoaders[code]();
  activeLocale = code;
  document.documentElement.lang = activeLocale;
  applyDomStrings(root);
}

/**
 * Switch locale, persist choice for the session, and re-apply DOM strings.
 * @param {string} locale
 * @param {ParentNode} [root]
 * @returns {Promise<string>} Resolved locale code.
 */
export async function setLocale(locale, root = document) {
  const resolved = isUiLocale(locale) ? String(locale).toLowerCase() : resolveLocale();
  try {
    sessionStorage.setItem(LOCALE_STORAGE_KEY, resolved);
  } catch (_error) {
    /* sessionStorage unavailable */
  }
  await initI18n(resolved, root);
  return resolved;
}

/**
 * Apply `data-i18n*` attributes under `root`. Safe to call again after locale change.
 * @param {ParentNode} [root]
 */
export function applyDomStrings(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const text = t(key);
    if (text !== key) el.textContent = text;
  });

  const attrMap = [
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-title", "title"],
    ["data-i18n-content", "content"],
  ];

  for (const [dataAttr, domAttr] of attrMap) {
    root.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
      const key = el.getAttribute(dataAttr);
      if (!key) return;
      const text = t(key);
      if (text !== key) el.setAttribute(domAttr, text);
    });
  }
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} path
 * @returns {unknown}
 */
function resolvePath(obj, path) {
  return String(path || "")
    .split(".")
    .reduce((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return /** @type {Record<string, unknown>} */ (acc)[part];
    }, /** @type {unknown} */ (obj));
}
