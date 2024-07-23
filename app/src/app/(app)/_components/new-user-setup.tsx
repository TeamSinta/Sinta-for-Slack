import { getUser } from "@/server/auth";
import { NewUserProfileForm } from "@/app/(app)/_components/new-user-profile-form";
import { NewUserOrgForm } from "@/app/(app)/_components/new-user-org-form";
import { cookies } from "next/headers";
import { new_user_setup_step_cookie } from "@/config/cookie-keys";

export async function NewUserSetup() {
    const user = await getUser();

    if (!user?.isNewUser) {
        return null;
    }

    // Retrieve the current step from cookies or default to 1 if not set
    const cookieValue = cookies().get(
        `${new_user_setup_step_cookie}${user.id}`,
    )?.value;
    const currentStep = cookieValue ? parseInt(cookieValue, 10) : 1;

    // Define the forms for each step
    const forms: Record<number, JSX.Element> = {
        1: <NewUserProfileForm user={user} currentStep={currentStep} />,
        2: <NewUserOrgForm currentStep={currentStep} userId={user?.id} />,
    };

    // Ensure the currentStep is valid (either 1 or 2)
    const stepToShow = forms[currentStep] ? currentStep : 1;

    return (
        <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center bg-black/80">
            <div className="w-full max-w-xl">{forms[stepToShow]}</div>
        </div>
    );
}
