import { PencilIcon } from 'lucide-react'; // Import an icon for the button

type EditButtonProps = {
    onClick?: () => void;
};

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
        >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
        </button>
    );
};
