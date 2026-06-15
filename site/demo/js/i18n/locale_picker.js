/**
 * Custom language picker for the header (replaces native <select> UI).
 * Keeps a hidden #locale-select in sync for demo.js change handling.
 */
import { t, UI_LOCALES } from "./index.js";

const LOCALE_LABEL_KEYS = {
  de: "nav.localeDe",
  en: "nav.localeEn",
};

let localePickerBound = false;

function getLocalePicker(selectEl) {
  const root = selectEl?.closest(".locale-picker");
  if (!root) return null;
  return {
    root,
    select: selectEl,
    trigger: root.querySelector(".locale-picker__trigger"),
    valueEl: root.querySelector(".locale-picker__value"),
    menu: root.querySelector(".locale-picker__menu"),
  };
}

function positionLocaleMenu(picker) {
  if (!picker?.trigger || !picker.menu) return;
  const rect = picker.trigger.getBoundingClientRect();
  const gap = 6;
  const maxHeight = Math.min(200, Math.max(80, globalThis.innerHeight - rect.bottom - gap - 12));
  picker.menu.style.top = `${rect.bottom + gap}px`;
  picker.menu.style.left = `${rect.left}px`;
  picker.menu.style.width = `${Math.max(rect.width, 140)}px`;
  picker.menu.style.maxHeight = `${maxHeight}px`;
}

function setLocaleMenuOpen(picker, open) {
  if (!picker?.trigger || !picker.menu) return;
  picker.trigger.setAttribute("aria-expanded", open ? "true" : "false");
  picker.menu.hidden = !open;
  if (open) {
    positionLocaleMenu(picker);
    const selected = picker.menu.querySelector('[aria-selected="true"]');
    (selected || picker.menu.querySelector(".locale-picker__option"))?.scrollIntoView({
      block: "nearest",
    });
  }
}

function syncLocalePickerUi(picker) {
  if (!picker?.select) return;
  const select = picker.select;
  const opt = select.options[select.selectedIndex];
  if (picker.valueEl) {
    picker.valueEl.textContent = opt?.textContent || "";
  }
  if (picker.menu) {
    for (const item of picker.menu.querySelectorAll(".locale-picker__option")) {
      item.setAttribute(
        "aria-selected",
        item.dataset.value === select.value ? "true" : "false",
      );
    }
  }
  if (picker.trigger) picker.trigger.disabled = select.disabled;
}

function chooseLocaleOption(picker, item) {
  if (!picker?.select || !item) return;
  picker.select.value = item.dataset.value || "";
  syncLocalePickerUi(picker);
  picker.select.dispatchEvent(new Event("change", { bubbles: true }));
  setLocaleMenuOpen(picker, false);
  picker.trigger?.focus();
}

function bindLocalePickerOnce(selectEl) {
  if (!selectEl || localePickerBound) return;
  const picker = getLocalePicker(selectEl);
  if (!picker?.trigger || !picker.menu) return;
  localePickerBound = true;

  const onReposition = () => {
    if (picker.trigger.getAttribute("aria-expanded") === "true") {
      positionLocaleMenu(picker);
    }
  };
  globalThis.addEventListener("resize", onReposition);
  globalThis.addEventListener("scroll", onReposition, true);

  picker.trigger.addEventListener("click", () => {
    const open = picker.trigger.getAttribute("aria-expanded") !== "true";
    setLocaleMenuOpen(picker, open);
  });

  picker.trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setLocaleMenuOpen(picker, true);
      picker.menu.querySelector('[aria-selected="true"]')?.focus();
    }
  });

  picker.menu.addEventListener("click", (event) => {
    const item = event.target.closest(".locale-picker__option");
    if (!item) return;
    chooseLocaleOption(picker, item);
  });

  picker.menu.addEventListener("keydown", (event) => {
    const items = [...picker.menu.querySelectorAll(".locale-picker__option")];
    const index = items.indexOf(globalThis.document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setLocaleMenuOpen(picker, false);
      picker.trigger.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[Math.min(index + 1, items.length - 1)]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index <= 0) {
        setLocaleMenuOpen(picker, false);
        picker.trigger.focus();
        return;
      }
      items[index - 1]?.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = globalThis.document.activeElement;
      if (!item?.classList.contains("locale-picker__option")) return;
      chooseLocaleOption(picker, item);
    }
  });

  globalThis.document.addEventListener("click", (event) => {
    if (!picker.root.contains(event.target)) {
      setLocaleMenuOpen(picker, false);
    }
  });
}

/** Fills the header language picker from UI_LOCALES. */
export function populateLocalePicker(selectEl, selectedLocale) {
  if (!selectEl) return;
  const picker = getLocalePicker(selectEl);
  selectEl.innerHTML = "";
  if (picker?.menu) picker.menu.innerHTML = "";

  for (const code of UI_LOCALES) {
    const labelKey = LOCALE_LABEL_KEYS[code];
    const label = labelKey ? t(labelKey) : code;
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = label;
    selectEl.appendChild(opt);

    if (picker?.menu) {
      const item = document.createElement("li");
      item.className = "locale-picker__option";
      item.setAttribute("role", "option");
      item.tabIndex = -1;
      item.dataset.value = code;
      item.textContent = label;
      picker.menu.appendChild(item);
    }
  }

  if (selectedLocale) selectEl.value = selectedLocale;
  bindLocalePickerOnce(selectEl);
  syncLocalePickerUi(picker);
  setLocaleMenuOpen(picker, false);
}

/** Focus the visible language picker trigger. */
export function focusLocalePicker(selectEl) {
  const picker = getLocalePicker(selectEl);
  if (picker?.trigger) {
    picker.trigger.focus();
    return;
  }
  selectEl?.focus();
}
