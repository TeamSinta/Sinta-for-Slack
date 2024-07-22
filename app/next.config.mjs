/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optionally, add any other Next.js config below
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
    transpilePackages: ["@radix-ui/react-dialog"],

    images: {
        domains: ["assets-global.website-files.com", "uploads-ssl.webflow.com"],
    },

    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
