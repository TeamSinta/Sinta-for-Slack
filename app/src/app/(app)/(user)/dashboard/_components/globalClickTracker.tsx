"use client";

import mixpanel from "mixpanel-browser";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GlobalClickTracker() {
    const pathName = usePathname();
    const session = useSession();
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (session.data?.user.id) {
                const target = event.target as HTMLElement;

                if (target.tagName === "BUTTON" || target.tagName === "A") {
                    console.log("CLICKED", target.innerText);
                    const elementType = target.tagName.toLowerCase();
                    const elementText =
                        target.innerText || target.getAttribute("aria-label");
                    const elementHref = target.getAttribute("href") || null;

                    mixpanel.track("Button Click", {
                        button_text: elementText,
                        button_link: elementHref,
                        button_clicked_from: pathName,
                        user_id: session.data?.user?.id,
                    });
                }
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [pathName, session]);

    return null;
}
