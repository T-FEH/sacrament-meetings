/**
 * Canonical site URL used for metadataBase, canonical links, and Open Graph.
 *
 * VERCEL_URL is the deployment-specific host (…-97zft9ya5-….vercel.app), which
 * changes on every deploy and is wrong to publish in og:url. Vercel also
 * exposes VERCEL_PROJECT_PRODUCTION_URL, the stable production domain, so that
 * is preferred.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

export const siteName = 'Sacrament Meeting Planner';

export const siteDescription =
  'Plan, review, and print sacrament meeting agendas including hymns, prayers, ward business, speakers, and musical numbers.';

/**
 * Shared Open Graph image.
 *
 * A route that declares its own `openGraph` replaces the parent's entire
 * openGraph object, which silently drops the app/opengraph-image.png the file
 * convention would otherwise contribute. Every route that sets openGraph must
 * therefore include this explicitly.
 */
export const ogImage = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'Sacrament Meeting Planner — agendas, hymns, prayers, speakers and ward business.',
};
