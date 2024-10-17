// @ts-nocheck

"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    deleteHiringroomMutation,
    updateHiringroomMutation,
} from "@/server/actions/hiringrooms/mutations";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";

type HiringroomStatus = "Active" | "Inactive" | "Archived";

export function ColumnDropdown({ id }: { id: string }) {
    const router = useRouter();

    // Mutation to update the hiringroom status
    const {
        mutateAsync: changeStatusMutate,
        isPending: changeStatusIsPending,
    } = useMutation<unknown, unknown, { id: string; status: HiringroomStatus }>(
        {
            mutationFn: ({ id, status }) =>
                updateHiringroomMutation({ id, status }),
            onSettled: () => {
                router.refresh();
            },
        },
    );

    const [
        statusChangeIsTransitionPending,
        startAwaitableStatusChangeTransition,
    ] = useAwaitableTransition();

    const onStatusChange = (newStatus: HiringroomStatus) => {
        toast.promise(
            async () => {
                await changeStatusMutate({ id: id, status: newStatus });
                await startAwaitableStatusChangeTransition(() => {
                    router.refresh();
                });
            },
            {
                loading: "Updating hiringroom status...",
                success: "Hiringroom status updated!",
                error: "Failed to update status, check your permissions.",
            },
        );
    };

    // Mutation to delete a hiringroom
    const {
        mutateAsync: removeHiringroomMutate,
        isPending: removeHiringroomIsPending,
    } = useMutation({
        mutationFn: ({}: { hiringroomId: string }) =>
            deleteHiringroomMutation({ id }),
    });

    const [
        removeHiringroomIsTransitionPending,
        startAwaitableRemoveHiringroomTransition,
    ] = useAwaitableTransition();

    const onRemoveHiringroom = async () => {
        toast.promise(
            async () => {
                await removeHiringroomMutate({ hiringroomId: id });
                await startAwaitableRemoveHiringroomTransition(() => {
                    router.refresh();
                    toast.success("Hiringroom removed successfully!");
                });
            },
            {
                loading: "Removing hiringroom...",
                error: "Failed to remove hiringroom.",
            },
        );
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-screen max-w-[12rem]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    disabled={
                        changeStatusIsPending || statusChangeIsTransitionPending
                    }
                    onClick={() => onStatusChange("Active")} // Activate
                >
                    Activate
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={
                        changeStatusIsPending || statusChangeIsTransitionPending
                    }
                    onClick={() => onStatusChange("Inactive")} // Deactivate
                >
                    Deactivate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    disabled={
                        removeHiringroomIsPending ||
                        removeHiringroomIsTransitionPending
                    }
                    onClick={onRemoveHiringroom}
                    className="text-red-600"
                >
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
