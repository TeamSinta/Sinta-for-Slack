import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import missingImage from "../../../../../public/Missing.jpg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const AlertIntegrationDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
    <Button className="bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
    Create Workflow </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Integrations Required</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <Image src={missingImage} alt="Alert" className="rounded-lg py-2"  />
        <p className="">
        Hey there! Looks like you haven&#39;t connected your Greenhouse & Slack. Connect them first, then you can unleash your workflow wizardry. 🧙‍♂️✨
        </p>

              </DialogDescription>
      <DialogFooter>
      <Button className="hover:bg-indigo-500 ">
          <Link href="/integrations">Go to Integration Page</Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
