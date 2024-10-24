import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { useRouter } from "next/navigation";

const MissingWebhookConfigModal = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const router = useRouter();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Missing Webhook Configuration
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Some configuration must be done to use this feature. Go
                        to the integrations page to set up your webhook.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            router.push("/integrations/greenhouse-config");
                        }}
                    >
                        Go to Integrations Page
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default MissingWebhookConfigModal;
