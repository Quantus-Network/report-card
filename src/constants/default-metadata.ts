import env from "@/config";
import type { SEOProps } from "astro-seo";

const title = {
  template: `%s | ${env.SITE_NAME}`,
  default: "Quantus Network - Report Card",
};
const description =
  "A quantum-secure, open-source Layer 1 blockchain built with post-quantum cryptography and zk-proof scalability to future-proof your digital assets.";
const image = {
  url: `${env.SITE_BASE_URL}/banner-small.jpeg`,
  secureUrl: `${env.SITE_BASE_URL}/banner-small.jpeg`,
  alt: title.default,
  width: 600,
  height: 200,
  type: "image/jpeg",
};

const defaultMetadata: SEOProps = {
  title: title.default,
  description,
  canonical: env.SITE_BASE_URL,
  titleDefault: title.default,
  titleTemplate: title.template,
  openGraph: {
    basic: {
      image: image.url,
      title: title.default,
      type: "website",
      url: env.SITE_BASE_URL,
    },
    image,
    optional: {
      siteName: env.SITE_NAME,
      description,
      locale: "en_US",
    },
  },
  twitter: {
    title: title.default,
    description,
    image: image.url,
    imageAlt: image.alt,
    site: env.SITE_BASE_URL,
    creator: "Quantus Labs",
    card: "summary_large_image",
  },
};

export default defaultMetadata;
