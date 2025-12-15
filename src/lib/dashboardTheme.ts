export type DashboardThemeMode = "light" | "dark" | "custom";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string) {
  const raw = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHsl(rgb: { r: number; g: number; b: number }) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function setVar(target: HTMLElement, name: string, value: string | null) {
  if (!value) target.style.removeProperty(name);
  else target.style.setProperty(name, value);
}

export function applyDashboardTheme(params: {
  themeMode: string | null | undefined;
  customColor?: string | null | undefined;
}) {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;

  const mode: DashboardThemeMode =
    params.themeMode === "dark"
      ? "dark"
      : params.themeMode === "custom"
      ? "custom"
      : "light";

  body.classList.toggle("dark", mode === "dark");

  if (mode === "dark") {
    body.style.colorScheme = "dark";
  } else {
    body.style.colorScheme = "light";
  }

  const color = typeof params.customColor === "string" ? params.customColor : "";
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb) : null;

  if (mode !== "custom" || !hsl) {
    setVar(body, "--background", null);
    setVar(body, "--card", null);
    setVar(body, "--popover", null);
    setVar(body, "--border", null);
    setVar(body, "--input", null);
    setVar(body, "--primary", null);
    setVar(body, "--ring", null);
    setVar(body, "--accent", null);
    return;
  }

  const h = hsl.h;
  const accentS = clamp(Math.round(hsl.s * 0.95), 55, 90);
  const accentL = clamp(Math.round(hsl.l * 0.95), 38, 58);

  setVar(body, "--background", `${h} 35% 98%`);
  setVar(body, "--card", `${h} 35% 99%`);
  setVar(body, "--popover", `${h} 35% 99%`);
  setVar(body, "--border", `${h} 18% 90%`);
  setVar(body, "--input", `${h} 18% 90%`);
  setVar(body, "--accent", `${h} 30% 96%`);
  setVar(body, "--primary", `${h} ${accentS}% ${accentL}%`);
  setVar(body, "--ring", `${h} ${accentS}% ${accentL}%`);
}

export function resetDashboardTheme() {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;
  body.classList.remove("dark");
  body.style.colorScheme = "light";
  setVar(body, "--background", null);
  setVar(body, "--card", null);
  setVar(body, "--popover", null);
  setVar(body, "--border", null);
  setVar(body, "--input", null);
  setVar(body, "--primary", null);
  setVar(body, "--ring", null);
  setVar(body, "--accent", null);
}

export function storeDashboardTheme(params: {
  themeMode: string;
  customColor?: string | null;
}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("relead.dashboard.themeMode", params.themeMode);
    if (params.customColor) {
      window.localStorage.setItem("relead.dashboard.customColor", params.customColor);
    } else {
      window.localStorage.removeItem("relead.dashboard.customColor");
    }
  } catch {
    // ignore
  }
}

export function readStoredDashboardTheme(): {
  themeMode: string | null;
  customColor: string | null;
} {
  if (typeof window === "undefined") return { themeMode: null, customColor: null };
  try {
    return {
      themeMode: window.localStorage.getItem("relead.dashboard.themeMode"),
      customColor: window.localStorage.getItem("relead.dashboard.customColor"),
    };
  } catch {
    return { themeMode: null, customColor: null };
  }
}
