interface Navigation {
  label: string;
  children: {
    href: string;
    label: string;
    target?: string;
    rel?: string;
  }[];
}

export const FOOTER_NAVIGATIONS: Navigation[] = [
  {
    label: "footer.navigation.resources.title",
    children: [
      {
        href: "https://t.me/quantusnetwork",
        label: "footer.navigation.resources.community",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      // { href: "/tutorials", label: "footer.navigation.resources.tutorials" },
      {
        href: "https://github.com/Quantus-Network/chain",
        label: "footer.navigation.resources.documentation",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        href: "https://t.me/quantustechsupport",
        label: "footer.navigation.resources.tech_support",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
  {
    label: "footer.navigation.info.title",
    children: [
      { href: "/about", label: "footer.navigation.info.company" },
      // { href: "/audits", label: "footer.navigation.info.audits" },
      {
        href: "/terms-and-privacy",
        label: "footer.navigation.info.terms",
      },
      {
        href: "/terms-and-privacy#privacy",
        label: "footer.navigation.info.privacy",
      },
    ],
  },
] as const;
