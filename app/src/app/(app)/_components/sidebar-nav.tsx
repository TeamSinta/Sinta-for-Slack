"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { type IconProps } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { orgConfig } from "@/config/organization";
import { sidebarConfig } from "@/config/sidebar";
import useGetCookie from "@/hooks/use-get-cookie";
import { cn, isLinkActive } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import mixpanel from "mixpanel-browser";
import { type User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * SidebarNav is a component that renders the sidebar navigation for the dashboard.
 * It uses the dashboardConfig.navigation to render the navigation items.
 * To add a new navigation item, you can add a new object to the dashboardConfig.navigation array @see /src/config/dashboard.ts
 *
 * @customize button ui update link style to match the design system
 */

//TODO: Make it more easy to customize the sidebar

type LinkStyleProps = {
    active?: boolean;
    disabled?: boolean;
    className?: string;
} & VariantProps<typeof buttonVariants>;

function linkStyle({ active, disabled, className, ...props }: LinkStyleProps) {
    return cn(
        buttonVariants({
            variant: active ? "secondary" : "ghost",
            size: props.size,
            ...props,
        }),
        "flex h-8 w-full items-center justify-start gap-3 px-3",
        disabled && "pointer-events-none opacity-50",
        className,
    );
}

type SidebarNavProps = {
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    user?: User | null;
};

export function SidebarNav({
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    user,
}: SidebarNavProps) {
    const isCollapsed = false;
    const pathname = usePathname();

    const sidebarNavItems = sidebarConfig.filterNavItems({
        removeIds: sidebarNavRemoveIds,
        includedIds: sidebarNavIncludeIds,
    });

    return (
        <nav>
            {sidebarNavItems.map((nav, index) => (
                <div key={nav.id}>
                    {nav.showLabel && (
                        <h3 className="mb-2 px-2 pt-3 text-xs font-semibold uppercase text-muted-foreground">
                            {nav.label}
                        </h3>
                    )}
                    <ul className="flex flex-col gap-1">
                        {nav.items.map((item) => (
                            <li key={item.label}>
                                {item.subMenu ? (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        defaultValue={
                                            item.subMenu.find((subItem) =>
                                                isLinkActive(
                                                    subItem.href,
                                                    pathname,
                                                ),
                                            )
                                                ? item.label
                                                : undefined
                                        }
                                    >
                                        <AccordionItem value={item.label}>
                                            <AccordionTrigger
                                                className={linkStyle({
                                                    active: item.subMenu.some(
                                                        (subItem) =>
                                                            isLinkActive(
                                                                subItem.href,
                                                                pathname,
                                                            ),
                                                    ),
                                                    className:
                                                        "justify-between",
                                                })}
                                            >
                                                <div className="flex items-center justify-start gap-3 ">
                                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                                    {!isCollapsed && (
                                                        <span className="truncate">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent
                                                className={cn(
                                                    " flex flex-col gap-1 pt-1",
                                                    isCollapsed
                                                        ? ""
                                                        : "relative pl-7 pr-0",
                                                )}
                                            >
                                                {item.subMenu.map((subItem) => (
                                                    <NavLink
                                                        key={subItem.label}
                                                        {...subItem}
                                                        Icon={subItem.icon}
                                                        active={isLinkActive(
                                                            pathname,
                                                            subItem.href,
                                                        )}
                                                        user={user}
                                                    />
                                                ))}

                                                {!isCollapsed && (
                                                    <Separator
                                                        orientation="vertical"
                                                        className="absolute bottom-2 left-5 right-auto"
                                                    />
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                ) : (
                                    <NavLink
                                        {...item}
                                        Icon={item.icon}
                                        active={isLinkActive(
                                            item.href,
                                            pathname,
                                        )}
                                        user={user}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>

                    {index !== sidebarNavItems.length - 1 && (
                        <Separator className="my-2" />
                    )}
                </div>
            ))}
        </nav>
    );
}

type NavLinkProps = {
    href: string;
    label: string;
    Icon: React.ComponentType<IconProps>;
    disabled?: boolean;
    active?: boolean;
    size?: ButtonProps["size"];
    user?: User | null;
};

function NavLink({
    href,
    label,
    Icon,
    disabled,
    active,
    size = "default",
    user,
}: NavLinkProps) {
    const orgCookie = useGetCookie(orgConfig.cookieName);
    return (
        <Link
            href={href}
            className={linkStyle({ active, disabled, size })}
            onClick={() => {
                mixpanel.track("Nav Bar Clicked", {
                    distinct_id: user?.id,
                    page: href,
                    item_name: label,
                    clicked_at: new Date().toISOString(),
                    user_id: user?.id,
                    organization_id: orgCookie,
                });
            }}
        >
            <Icon className={cn("flex-shrink-0 w-4 h-4")} />
            <span className="truncate">{label}</span>
        </Link>
    );
}
