import type { MetadataRoute } from 'next';
import { createClient as adminClient } from '@supabase/supabase-js';

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
    .select('id, updated_at')
    .order('views', { ascending: false });

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

  return [...staticEntries, ...providerEntries];
}
