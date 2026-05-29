import 'server-only';

export type Locale = 'en' | 'th';

export const locales: Locale[] = ['en', 'th'];
export const defaultLocale: Locale = 'th';

const dictionaries = {
  en: () => import('./en.json').then((m) => m.default),
  th: () => import('./th.json').then((m) => m.default),
};

export function hasLocale(locale: string): locale is Locale {
  return locale in dictionaries;
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
