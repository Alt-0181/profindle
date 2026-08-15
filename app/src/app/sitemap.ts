import type { MetadataRoute } from 'next';
import { createClient as adminClient } from '@supabase/supabase-js';
import { serviceSlug, provinceSlug, MIN_INDEXABLE } from '@/lib/directory';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';
const locales = ['en', 'th'];

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = getAdmin();
  const { data: companies } = await admin
    .from('companies')
    .select('id, updated_at, services, province')
    .order('views', { ascending: false });

  // Count providers per service and per service×province — only index directory
  // pages with enough providers to be genuinely useful (avoids thin pages).
  const svcCount: Record<string, number> = {};
  const svcProvCount: Record<string, number> = {};
  for (const c of companies ?? []) {
    for (const s of (c.services as string[] | null) ?? []) {
      const ss = serviceSlug(s);
      svcCount[ss] = (svcCount[ss] ?? 0) + 1;
      if (c.province) svcProvCount[`${ss}/${provinceSlug(c.province)}`] = (svcProvCount[`${ss}/${provinceSlug(c.province)}`] ?? 0) + 1;
    }
  }
  const directoryRoutes = [
    '/services',
    ...Object.entries(svcCount).filter(([, n]) => n >= MIN_INDEXABLE).map(([s]) => `/services/${s}`),
    ...Object.entries(svcProvCount).filter(([, n]) => n >= MIN_INDEXABLE).map(([sp]) => `/services/${sp}`),
  ];
  const directoryEntries = locales.flatMap((lang) =>
    directoryRoutes.map((route) => ({
      url: `${siteUrl}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  const staticRoutes = ['', '/search-providers'];

  const staticEntries = locales.flatMap((lang) =>
    staticRoutes.map((route) => ({
      url: `${siteUrl}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  const providerEntries = locales.flatMap((lang) =>
    (companies ?? []).map((c) => ({
      url: `${siteUrl}/${lang}/providers/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...directoryEntries, ...providerEntries];
}
