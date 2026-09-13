import { revalidateTag } from 'next/cache';

/** Cache tag for the public provider directory (search-providers listing). */
export const COMPANIES_TAG = 'companies';

/**
 * Invalidate the cached public company directory so that admin/provider edits
 * — verify, premium, rename, claim, import, delete, profile save — appear in
 * search immediately instead of waiting for the 60s time-based revalidation.
 *
 * Safe to call from any Route Handler / Server Action. Wrapped in try/catch
 * because revalidateTag throws if ever invoked outside a request scope.
 */
export function revalidateCompanies() {
  try {
    // Next 16 requires a cache-life profile; "max" = stale-while-revalidate.
    revalidateTag(COMPANIES_TAG, 'max');
  } catch {
    // no-op: outside a request/render scope
  }
}
