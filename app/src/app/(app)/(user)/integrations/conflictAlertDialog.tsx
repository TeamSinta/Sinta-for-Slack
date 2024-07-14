import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ConflictImage from "../../../../../public/ConflictImage.png";



export const ConflictAlertModal = () => (
    <Dialog defaultOpen={true}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Slack Integration Conflict</DialogTitle>
            </DialogHeader>
            <DialogDescription>
            <Image
                    src={ConflictImage}
                    alt="Alert"
                    className="rounded-lg py-2"
                />
                <p>It looks like this Slack team is already integrated with another organization. Please disconnect it from the other organization first.</p>
            </DialogDescription>
            <DialogFooter>
                <Button className="hover:bg-indigo-500 ">
                    <Link href="/">Go to Home Page</Link>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
