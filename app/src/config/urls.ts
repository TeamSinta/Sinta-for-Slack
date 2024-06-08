/**
 * @purpose This file contains all the site urls
 *
 * To add a new URL:
 * 1. Add a new property to the siteUrls object with the URL path.
 * 2. Import the siteUrls object from "@/config/urls" in the file where you want to use the URL.
 * 3. Use the URL in the file.
 */

export const siteUrls = {
    publicUrl:
        "https://103ed68b03da.ngrok.app",
    github: "https://github.com/msinta/",
    home: "/",
    auth: {
        login: "/auth/login",
        signup: "/auth/signup",
    },
    pricing: "/pricing",
    features: "/features",
    support: "/support",
    blog: "/blog",
    docs: "/docs/introduction",
    maintenance: "/maintenance",
    teamsinta: "https://teamsinta.vercel.app/",
    dashboard: {
        home: "/dashboard",
    },
    triggers: {
        home: "/triggers",
    },
    workflows: {
        home: "/workflows",
    },
    integrations: {
        home: "/integrations",
    },
    feedback: "/feedback",
    organization: {
        members: {
            home: "/org/members",
            invite: "/org/members/invite",
        },
        settings: "/org/settings",
    },
    admin: {
        dashboard: "/admin/dashboard",
        users: "/admin/users",
        blog: "/admin/blog",
        settings: "/admin/settings",
        feedbacks: "/admin/feedbacks",
    },
    profile: {
        settings: "/profile/settings",
        billing: "/profile/billing",
    },
    success: {
        // Adding the success route here
        base: "/success", // Base path for success
        detail: "/success/[id]", // Dynamic path for specific success instances
    },
} as const;

export const publicRoutes: string[] = [
    siteUrls.publicUrl,
    siteUrls.home,
    siteUrls.pricing,
    siteUrls.features,
    siteUrls.support,
    siteUrls.blog,
    siteUrls.docs,
    siteUrls.maintenance,
];
