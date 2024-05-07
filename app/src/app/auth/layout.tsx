import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Link from "next/link";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen w-screen grid-cols-3">
            <main className="col-span-2 flex items-center justify-center">
                {children}
            </main>
            <aside className="col-span-1 flex flex-col items-start justify-center gap-6 border-l border-border bg-muted/30 p-10">
                <Icons.logo as="h3" />
                <h2 className="text-3xl font-medium">
                    Streamline your hiring workflows in Slack.
                </h2>
                <p className="font-light text-muted-foreground">
                    Design your perfect hiring strategy and bring it to life
                    with real-time automations—simplify your process and cut
                    through the chaos, all within your favourite messaging app{" "}
                    <Link
                        href={siteUrls.teamsinta}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        teamsinta.vercel.app
                    </Link>
                </p>
            </aside>
        </div>
    );
}
