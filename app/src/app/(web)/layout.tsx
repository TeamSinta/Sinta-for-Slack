import { WebHeader } from "@/app/(web)/_components/header";
import BackgroundGradient from "./_components/background-gradiant";

type WebLayoutProps = {
    children: React.ReactNode;
};

export default function WebLayout({ children }: WebLayoutProps) {
    return (
        <>
            <BackgroundGradient />
            <div>
                <WebHeader />
                {children}
            </div>
        </>
    );
}
