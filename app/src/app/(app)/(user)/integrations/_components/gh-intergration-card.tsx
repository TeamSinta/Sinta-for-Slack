"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setGreenhouseDetails } from "@/server/actions/greenhouse/mutations";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import mixpanel from "mixpanel-browser";
import { orgConfig } from "@/config/organization";
import useGetCookie from "@/hooks/use-get-cookie";
import Link from "next/link";
interface GreenhouseIntegrationCardProps {
    name: string;
    imageUrl: string;
    buttonText: string;
    isConnected?: boolean;
    lastModified?: string;
}

const formSchema = z.object({
    subDomain: z
        .string()
        .min(3, { message: "Sub-domain must be at least 3 characters." }),
    token: z
        .string()
        .min(10, { message: "API Token must be at least 10 characters." }),
});

export const GreenhouseIntegrationCard: React.FC<
    GreenhouseIntegrationCardProps
> = ({ name, imageUrl, buttonText, isConnected, lastModified }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const session = useSession();
    const router = useRouter();
    const orgCookie = useGetCookie(orgConfig.cookieName);
    const [, startAwaitableTransition] = useAwaitableTransition();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subDomain: "",
            token: "",
        },
    });

    const handleDetailsSubmit = async (values: {
        subDomain: string;
        token: string;
    }) => {
        const response = await setGreenhouseDetails(
            values.subDomain,
            values.token,
        );
        if (response === "OK") {
            setIsModalOpen(false);
            toast.success("API key and sub-domain successfully connected");
            await startAwaitableTransition(() => {
                router.refresh();
            });
        } else {
            toast.error("Failed to connect API key and sub-domain");
        }
    };

    function trackModalEvent(open: boolean) {
        mixpanel.track(open ? "Modal Shown" : "Modal Dismissed", {
            distinct_id: session.data?.user?.id,
            modal_name: "Greenhouse Integration Modal",
            modal_page: "/integrations",
            modal_shown_at: new Date().toISOString(),
            user_id: session.data?.user?.id,
            organization_id: orgCookie,
        });
    }
    return (
        <>
            <Card className="flex w-full items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-lg font-medium leading-none">
                            {name}
                        </p>
                        {isConnected && (
                            <div className="mt-1 flex items-center">
                                <div className="mr-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-200 dark:text-green-900">
                                    Connected
                                </div>
                                <span className="text-sm text-gray-500">
                                    Last modified: {lastModified}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <Link
                        href="/integrations/greenhouse-config"
                        className="ml-2 rounded bg-gray-400 px-4 py-2 text-sm text-white hover:bg-gray-600"
                    >
                        Config
                    </Link>
                    <Button
                        className="ml-2 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        onClick={() => {
                            trackModalEvent(true);
                            setIsModalOpen(true);
                        }}
                    >
                        {buttonText}
                    </Button>
                </div>
            </Card>
            <Dialog
                open={isModalOpen}
                onOpenChange={(
                    open: boolean | ((prevState: boolean) => boolean),
                ) => {
                    if (!open) trackModalEvent(false);
                    setIsModalOpen(open);
                }}
            >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Enter Greenhouse Details</DialogTitle>
                        <DialogDescription>
                            Please enter your Greenhouse API token and
                            sub-domain to connect your account.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleDetailsSubmit)}
                            className="space-y-8"
                        >
                            <FormField
                                control={form.control}
                                name="subDomain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub-domain</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Sub-domain"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Allows Sinta to link to your
                                            greenhouse (ex. if your greenhouse
                                            URL is &#34;app3.greenhouse.io&#34;
                                            then your subdomain is
                                            &#34;app3&#34;)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Token</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="API Token"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter your Greenhouse API token. You
                                            can find this in your Greenhouse
                                            account settings.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};
