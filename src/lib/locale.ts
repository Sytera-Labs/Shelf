import { useSyncExternalStore } from "react";

export const LOCALES = [
  { id: "ru", code: "RU", name: "Русский" },
  { id: "en-US", code: "EN (US)", name: "English" },
  { id: "en-GB", code: "EN (UK)", name: "English" },
  { id: "de", code: "DE", name: "Deutsch" },
  { id: "it", code: "IT", name: "Italiano" },
  { id: "es", code: "ES", name: "Español" },
  { id: "ko", code: "KR", name: "한국어" },
  { id: "ja", code: "JP", name: "日本語" },
  { id: "zh-CN", code: "CN", name: "中文" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

const KEY = "shelf.locale";

export type KvStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryStorage: KvStorage = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

/** File on this computer when the program window provides it; otherwise the page store. */
export function programStorage(): KvStorage {
  if (typeof window !== "undefined") {
    const shelf = (window as Window & { shelf?: { storage?: KvStorage } }).shelf;
    if (shelf?.storage) return shelf.storage;
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch {
      /* unavailable */
    }
  }
  return memoryStorage;
}

function isLocale(value: string | null): value is Locale {
  return LOCALES.some((item) => item.id === value);
}

let current: Locale = "ru";
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return current;
}

export function setLocale(next: Locale) {
  current = next;
  void Promise.resolve(programStorage().setItem(KEY, next)).catch(() => {
    /* keep the choice for this run */
  });
  document.documentElement.lang = htmlLang(next);
  listeners.forEach((listener) => listener());
}

export function htmlLang(locale: Locale): string {
  if (locale === "zh-CN") return "zh-CN";
  if (locale === "en-US" || locale === "en-GB") return "en";
  return locale;
}

export async function hydrateLocale() {
  try {
    const saved = await programStorage().getItem(KEY);
    if (isLocale(saved)) current = saved;
  } catch {
    /* ignore */
  }
  document.documentElement.lang = htmlLang(current);
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getLocale,
    () => "ru",
  );
}
