import { SITE_CONFIG } from "@/lib/site";

interface JsonLdProps {
  faqs?: Array<{ question: string; answer: string }>;
}

export function JsonLd({ faqs }: JsonLdProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    alternateName: "WardrobeAI",
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.logo,
    parentOrganization: {
      "@type": "Organization",
      name: SITE_CONFIG.company.name,
      url: SITE_CONFIG.company.url,
    },
    sameAs: [
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.tiktok,
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: "Wardrobe AI Nigeria",
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.locale,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.company.name,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.logo,
      },
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    applicationCategory: "LifestyleApplication",
    applicationSubCategory: "Fashion & Wardrobe",
    operatingSystem: "Web, iOS, Android (PWA)",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description: SITE_CONFIG.description,
    image: SITE_CONFIG.ogImage,
    screenshot: `${SITE_CONFIG.url}/hero-app-preview.jpg`,
    offers: [
      {
        "@type": "Offer",
        name: "Starter Wardrobe",
        price: "0",
        priceCurrency: "NGN",
        category: "Free",
        description:
          "Up to 20 wardrobe items, 1 AI outfit generation per day with live Nigerian weather integration.",
      },
      {
        "@type": "Offer",
        name: "Wardrobe Pro",
        price: "1500",
        priceCurrency: "NGN",
        category: "Subscription",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "1500",
          priceCurrency: "NGN",
          unitText: "MONTH",
        },
        description:
          "Unlimited wardrobe items, unlimited daily outfit recommendations, event styling (Owambe, Weddings, Dates), full closet rotation, and 3-day free trial on signup.",
      },
    ],
    featureList: [
      "AI Outfit Recommendations strictly from clothes you own",
      "Camera photo upload & smart clothing recognition",
      "Live weather and humidity synchronization for Lagos, Abuja, and Nigerian cities",
      "Occasion styling for Work, Church, Owambe, Dates, and Casual",
      "Anchor item styling (Style around any piece)",
      "Zero external shopping links — 100% styled from your wardrobe",
      "Saved outfits library and wear counter",
    ],
  };

  const faqPageSchema =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {faqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />
      )}
    </>
  );
}

