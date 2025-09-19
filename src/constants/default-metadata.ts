import env from "@/config";
import type { SEOProps } from "astro-seo";

const title = {
  template: `%s | ${env.SITE_NAME}`,
  default: "Quantus Network - Report Card",
};
const description =
  "Get a comprehensive analysis of your Ethereum wallet's vulnerability to quantum computing threats. View your security score, risk factors, and personalized recommendations.";
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
