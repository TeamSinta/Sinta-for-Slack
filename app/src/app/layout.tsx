import React from "react";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import "@/styles/prism.css";
import { fontHeading, fontSans } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
    title: "Sinta - Hiring in Slack",
    description: "Streamline your hiring workflows in Slack",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontHeading.variable} overflow-x-hidden font-sans`}
            >
                <Providers>
                    {children}
                    <Toaster richColors position="top-right" expand />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
