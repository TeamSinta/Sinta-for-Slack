import { CheckCircle2Icon, CircleXIcon, PencilIcon } from "lucide-react"; // Import an icon for the button

type EditButtonProps = {
    onClick?: () => void;
    isEditing: boolean;
    onCancel?: () => void;
};

export const EditButton: React.FC<EditButtonProps> = ({
    onClick,
    isEditing,
    onCancel,
}) => {
    return (
        <div className="flex flex-row gap-2">
            {isEditing && (
                <button
                    onClick={onCancel}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                    <CircleXIcon className="mr-2 h-4 w-4" /> Cancel
                </button>
            )}
            <button
                onClick={onClick}
                className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
                {isEditing ? (
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                ) : (
                    <PencilIcon className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Done Editing" : "Edit"}
            </button>
        </div>
    );
};
