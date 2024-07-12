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
import { type WorkflowData } from "./columns";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    deleteWorkflowMutation,
    updateWorkflowMutation,
} from "@/server/actions/workflows/mutations";
import { useAwaitableTransition } from "@/hooks/use-awaitable-transition";

type WorkflowStatus = "Active" | "Inactive" | "Archived";

export function ColumnDropdown({ id }: WorkflowData) {
    const router = useRouter();

    // Mutation to update the workflow status
    const {
        mutateAsync: changeStatusMutate,
        isPending: changeStatusIsPending,
    } = useMutation<unknown, unknown, { id: string; status: WorkflowStatus }>({
        mutationFn: ({ id, status }) => updateWorkflowMutation({ id, status }),
        onSettled: () => {
            router.refresh();
        },
    });

    const [
        statusChangeIsTransitionPending,
        startAwaitableStatusChangeTransition,
    ] = useAwaitableTransition();

    const onStatusChange = (newStatus: WorkflowStatus) => {
        toast.promise(
            async () => {
                await changeStatusMutate({ id: id, status: newStatus });
                await startAwaitableStatusChangeTransition(() => {
                    router.refresh();
                });
            },
            {
                loading: "Updating workflow status...",
                success: "Workflow status updated!",
                error: "Failed to update status, check your permissions.",
            },
        );
    };

    // Mutation to delete a workflow
    const {
        mutateAsync: removeWorkflowMutate,
        isPending: removeWorkflowIsPending,
    } = useMutation({
        mutationFn: ({}: { workflowId: string }) =>
            deleteWorkflowMutation({ id }),
    });

    const [
        removeWorkflowIsTransitionPending,
        startAwaitableRemoveWorkflowTransition,
    ] = useAwaitableTransition();

    const onRemoveWorkflow = async () => {
        toast.promise(
            async () => {
                await removeWorkflowMutate({ workflowId: id });
                await startAwaitableRemoveWorkflowTransition(() => {
                    router.refresh();
                    toast.success("Workflow removed successfully!");
                });
            },
            {
                loading: "Removing workflow...",
                error: "Failed to remove workflow.",
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
                    onClick={() => router.push(`/workflows?edit=true&workflowId=${id}`)} // Activate
                >
                    Edit
                </DropdownMenuItem>
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
                        removeWorkflowIsPending ||
                        removeWorkflowIsTransitionPending
                    }
                    onClick={onRemoveWorkflow}
                    className="text-red-600"
                >
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
