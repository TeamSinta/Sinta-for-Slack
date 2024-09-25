import { PencilIcon } from "lucide-react"; // Import an icon for the button

type EditButtonProps = {
    onClick?: () => void;
};

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
        </button>
    );
};
