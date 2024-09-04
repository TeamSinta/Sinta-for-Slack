"use client";

import { Slot } from "@radix-ui/react-slot";
import { signOut } from "next-auth/react";
import React from "react";

type SignoutTriggerProps = {
    callbackUrl?: string;
    redirect?: boolean;
    asChild?: boolean;
    children?: React.ReactNode;
    onClick?: () => Promise<void> | (() => void);
} & React.HTMLAttributes<HTMLButtonElement>;

export function SignoutTrigger({
    callbackUrl,
    redirect = true,
    asChild,
    children,
    onClick,
    ...props
}: SignoutTriggerProps) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            onClick={async () => {
                if (onClick) {
                    await onClick();
                }
                await signOut({ callbackUrl, redirect });
            }}
            {...props}
        >
            {children}
        </Comp>
    );
}
