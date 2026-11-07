/**
 * @fileoverview JSON-LD structured data helpers.
 *
 * Structured data lets search engines understand the site as entities
 * (Person, WebSite, Service) rather than just text — improving rich results.
 * Render the output inside a `<script type="application/ld+json">` tag.
 *
 * **Everything here is on the page.** The name, the promise, the batch size and
 * the entry price are all stated in the hero and the process screens. Nothing
 * is asserted that a reader could not check by looking — no address, no rating,
 * no `sameAs` to accounts nobody has confirmed. Structured data that outruns
 * the page is the kind that gets a site's rich results withdrawn.
 */

import { siteConfig } from "@/lib/site";

/**
 * Person + WebSite + Service for the site root. Emit once, in the root layout.
 * The nodes are linked by `@id` so crawlers treat them as one entity graph.
 *
 * **`Person`, not `Organization`.** The site sells one named creator's work and
 * the whole first screen is her name; an `Organization` would describe a company
 * that does not exist and would compete with the person for the same query.
 */
export function getSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        image: `${siteConfig.url}/opengraph-image.png`,
        jobTitle: "Video creator",
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        inLanguage: "en",
        publisher: { "@id": `${siteConfig.url}/#person` },
      },
      {
        "@type": "Service",
        "@id": `${siteConfig.url}/#service`,
        name: "Vertical video, by the batch",
        description:
          "Forty vertical video variants from five concepts — hooks, demos, unboxings and testimonials, licensed and disclosed, delivered in three days.",
        serviceType: "Vertical video production",
        provider: { "@id": `${siteConfig.url}/#person` },
        // The figure the page itself quotes. `lowPrice` rather than `price`
        // because the page says "from": a single `price` would be a promise
        // about work whose cost the page deliberately does not fix.
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          lowPrice: "1800",
          availability: "https://schema.org/InStock",
          url: siteConfig.url,
        },
      },
    ],
  };
}
