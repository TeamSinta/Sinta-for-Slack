"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ConflictImage from "../../../../../public/ConflictImage.png";
import { CircleAlert } from "lucide-react";
import mixpanel from "mixpanel-browser";

interface AlertPanelProps {
    userId?: string;
    organizationId?: string;
}
export const ConflictAlertModal = ({
    userId,
    organizationId,
}: AlertPanelProps) => (
    <Dialog
        defaultOpen={true}
        onOpenChange={(open) => {
            if (!open) {
                mixpanel.track("Modal Dismissed", {
                    distinct_id: userId,
                    modal_name: "Slack Integration Conflict",
                    modal_page: "/integrations",
                    modal_shown_at: new Date().toISOString(),
                    user_id: userId,
                    organization_id: organizationId,
                });
            }
        }}
    >
        <DialogContent>
            <DialogHeader>
                <div className="flex items-center ">
                    <CircleAlert className="mr-2 h-6 w-6 text-red-500" />
                    Slack Integration Conflict
                </div>{" "}
            </DialogHeader>
            <DialogDescription>
                <Image
                    src={ConflictImage}
                    alt="Alert"
                    className="rounded-lg px-24 "
                />
                <p>
                    It looks like this Slack team is already integrated with
                    another organization. Please disconnect it from the other
                    organization first or ask the adminstrator to join thier
                    organization.
                </p>
            </DialogDescription>
            <DialogFooter>
                <Button variant={"outline"}>
                    <Link href="/support">Send Support Ticket</Link>
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant={"default"}>
                        Close
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
