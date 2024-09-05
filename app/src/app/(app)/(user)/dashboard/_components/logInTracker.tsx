"use client";
import mixpanel from "mixpanel-browser";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Identify user on dashboard load
const LogInTracker = () => {
    const { data: session, status } = useSession();
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            mixpanel.identify(session.user.id);
        }
    }, [status, session]);
    return null;
};

export default LogInTracker;
