"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import mixpanel from "mixpanel-browser";

// Initialize mixpanel analytics
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";
mixpanel.init(MIXPANEL_TOKEN, { track_pageview: true });

type ProvidersProps = {
    children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <ThemeProvider>{children}</ThemeProvider>
            </SessionProvider>
        </QueryClientProvider>
    );
}
