"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import mixpanel from "mixpanel-browser";
import { SessionProvider } from "next-auth/react";

// Initialize mixpanel analytics
const MIXPANEL_TOKEN =
    process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ??
    "33423b0b278507a7f8b14f9b34694baf";

mixpanel.init(MIXPANEL_TOKEN);

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
