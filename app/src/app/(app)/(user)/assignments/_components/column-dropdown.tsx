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
import { type AssignmentData } from "./columns";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    deleteAssignmentMutation,
    updateAssignmentMutation,
} from "@/server/actions/assignments/mutations";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";

type AssignmentStatus = "Active" | "Inactive" | "Archived";

export function ColumnDropdown({ id }: any) {
    // export function ColumnDropdown({ id }: AssignmentData) {
    const router = useRouter();

    // Mutation to update the assignment status
    const {
        mutateAsync: changeStatusMutate,
        isPending: changeStatusIsPending,
    } = useMutation<unknown, unknown, { id: string; status: AssignmentStatus }>({
        mutationFn: ({ id, status }) => updateAssignmentMutation({ id, status }),
        onSettled: () => {
            router.refresh();
        },
    });

    const [
        statusChangeIsTransitionPending,
        startAwaitableStatusChangeTransition,
    ] = useAwaitableTransition();

    const onStatusChange = (newStatus: AssignmentStatus) => {
        toast.promise(
            async () => {
                await changeStatusMutate({ id: id, status: newStatus });
                await startAwaitableStatusChangeTransition(() => {
                    router.refresh();
                });
            },
            {
                loading: "Updating assignment status...",
                success: "Assignment status updated!",
                error: "Failed to update status, check your permissions.",
            },
        );
    };

    // Mutation to delete a assignment
    const {
        mutateAsync: removeAssignmentMutate,
        isPending: removeAssignmentIsPending,
    } = useMutation({
        mutationFn: ({}: { assignmentId: string }) =>
            deleteAssignmentMutation({ id }),
    });

    const [
        removeAssignmentIsTransitionPending,
        startAwaitableRemoveAssignmentTransition,
    ] = useAwaitableTransition();

    const onRemoveAssignment = async () => {
        toast.promise(
            async () => {
                await removeAssignmentMutate({ assignmentId: id });
                await startAwaitableRemoveAssignmentTransition(() => {
                    router.refresh();
                    toast.success("Assignment removed successfully!");
                });
            },
            {
                loading: "Removing assignment...",
                error: "Failed to remove assignment.",
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
                        removeAssignmentIsPending ||
                        removeAssignmentIsTransitionPending
                    }
                    onClick={onRemoveAssignment}
                    className="text-red-600"
                >
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
