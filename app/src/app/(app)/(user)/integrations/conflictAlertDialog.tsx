import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ConflictImage from "../../../../../public/ConflictImage.png";
import { CircleAlert } from "lucide-react";



export const ConflictAlertModal = () => (
    <Dialog defaultOpen={true}>
        <DialogContent>
            <DialogHeader>
            <div className="flex items-center ">
                        <CircleAlert className="h-6 w-6 text-red-500 mr-2" />
                        Slack Integration Conflict
                    </div>            </DialogHeader>
            <DialogDescription>
            <Image
                    src={ConflictImage}
                    alt="Alert"
                    className="rounded-lg px-24 "
                />
                <p>It looks like this Slack team is already integrated with another organization. Please disconnect it from the other organization first or ask the adminstrator to join thier organization.</p>
            </DialogDescription>
            <DialogFooter>

          <Button variant={'outline'} >
          <Link href="/support">Send Support Ticket</Link>
          </Button>
            <DialogClose asChild>
            <Button type="button" variant={'default'} >
              Close
            </Button>

          </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
