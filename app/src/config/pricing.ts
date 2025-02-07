/**
 * This file contains the pricing data for the pricing page.
 *
 * @add a new pricing plan, add a new object to the `pricing` array.
 * 1. Add id to the pricingIds object then use it as the id of the new pricing object.
 * 2. Add badge(optional), title, description, price, currency, duration, highlight, popular, and uniqueFeatures(optional) to the new pricing object.
 * 3. if the new pricing plan has unique features, add a new object to the `uniqueFeatures` array.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and inludedIn to the new feature object. (inludedIn is an array of pricing plan ids that include this feature)
 */

export type Pricing = {
    id: string;
    badge?: string;
    title: string;
    description: string;
    price: number;
    currency: {
        code: string;
        symbol: string;
    };
    duration: string;
    highlight: string;
    buttonHighlighted: boolean;
    uniqueFeatures?: string[];
};

export type Feature = {
    id: string;
    title: string;
    inludedIn: string[];
};

const pricingIds = {
    free: "free",
    pro: "pro",
    premium: "premium",
} as const;

export const features: Feature[] = [
    {
        id: "1",
        title: "SSO with unlimited social connections and MFA",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "2",
        title: "Custom domains",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "3",
        title: "Basic role and permission management",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "4",
        title: "View and manage users",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "5",
        title: "Custom Branding",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "7",
        title: "Team Sinta Branding",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "8",
        title: "Custom Branding",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "9",
        title: "Up to 2,000 machine to machine (M2M) connections",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "10",
        title: "Team Sinta  Branding",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "11",
        title: "Custom Branding",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "12",
        title: "Up to 2,000 machine to machine (M2M) connections",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "13",
        title: "Team Sinta  Branding",
        inludedIn: [pricingIds.premium],
    },
];

export const pricings: Pricing[] = [
    {
        id: pricingIds.free,
        title: "Free",
        description:
            "Everything you need to get started with 10,500 free MAU. No setup fees, monthly fees, or hidden fees.",
        price: 0,
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "Forever",
        highlight:
            "No credit card required. 30-day money-back guarantee. No hidden fees.",
        buttonHighlighted: false,
        uniqueFeatures: ["Up to 2,000 machine to machine (M2M) connections"],
    },
    {
        id: pricingIds.pro,
        badge: "Most Popular",
        title: "Pro",
        description:
            "Advanced features to help you scale any business without limits.",
        price: 49,
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight:
            "No credit card required. 30-day money-back guarantee. No hidden fees.",
        buttonHighlighted: true,
        uniqueFeatures: ["Up to 5,000 machine to machine (M2M) connections"],
    },
    {
        id: pricingIds.premium,
        title: "Premium",
        description:
            "For teams with more complex needs requiring the highest levels of support.",
        price: 199,
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight:
            "No credit card required. 30-day money-back guarantee. No hidden fees.",
        buttonHighlighted: false,
        uniqueFeatures: ["Up to 100,000 machine to machine (M2M) connections"],
    },
];
