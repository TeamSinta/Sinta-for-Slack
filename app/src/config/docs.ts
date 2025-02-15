/**
 * Docs navigation items
 * @type {DocsSidebarNavItems[]}
 * @property {string} id - The unique id of the navigation item.
 * @property {string} label - The label of the navigation item.
 * @property {DocsNavItem[]} items - The sub navigation items.
 *
 * @example
 * export const docsNavigation = [
 *  {
 *     id: "getting-started",
 *    label: "Getting Started",
 *   items: [
 *     {
 *      id: "installation",
 *     label: "Installation",
 *    href: "/docs/getting-started/installation",
 *  },
 * ]
 *
 * @returns The navigation items for the docs sidebar.
 *
 */

type DocsNavItem = {
    id: string;
    label: string;
    badge?: string;
} & (
    | { href: string; subItems?: never; disabled?: boolean }
    | {
          href?: never;
          subItems: {
              id: string;
              label: string;
              href: string;
              disabled?: boolean;
              badge?: string;
          }[];
      }
);

type DocsSidebarNavItems = {
    id: string;
    label: string;
    items: DocsNavItem[];
};

const nav: DocsSidebarNavItems[] = [
    {
        id: "introduction",
        label: "Introduction",
        items: [
            {
                id: "introduction",
                label: "What is Sinta?",
                href: "/docs/introduction",
            },
        ],
    },
    {
        id: "getting-started",
        label: "Getting Started",
        items: [
            {
                id: "installation",
                label: "Installation",
                href: "/docs/getting-started/installation",
            },
        ],
    },
    {
        id: "api",
        label: "API",
        items: [
            {
                id: "endpoints",
                label: "Endpoints",
                href: "/docs/api/endpoints",
                badge: "Soon",
                disabled: true,
            },
            {
                id: "authentication",
                label: "Authentication",
                subItems: [
                    {
                        id: "sign-up",
                        label: "Sign Up",
                        href: "/docs/api/authentication/sign-up",
                        disabled: true,
                    },
                    {
                        id: "sign-in",
                        label: "Sign In",
                        href: "/docs/api/authentication/sign-in",
                        disabled: true,
                    },
                    {
                        id: "sign-out",
                        label: "Sign Out",
                        href: "/docs/api/authentication/sign-out",
                        disabled: true,
                    },
                ],
            },
        ],
    },
];

export const docsConfig = {
    nav,
};
