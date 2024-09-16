import { motion } from "framer-motion";
interface TestResultProps {
    success: boolean;
    status: number;
    message: string;
    data?: string;
    showFullData?: boolean;
    setShowFullData?: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function TestResult({
    success,
    status,
    message,
    data,
    showFullData,
    setShowFullData,
}: TestResultProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: "easeOut",
            }}
            className={`mt-4 rounded-lg p-6 shadow-md ${
                success
                    ? "border-l-4 border-green-400 bg-green-50 text-green-800"
                    : "border-l-4 border-red-400 bg-red-50 text-red-800"
            }`}
            style={{
                maxWidth: "100%",
                wordWrap: "break-word",
            }}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                    {success ? "Test Successful" : "Test Failed"}
                </h3>
                <span className="font-semibold">Status Code: {status}</span>
            </div>
            <div className="mt-2">
                <p className="font-medium">Response Data:</p>
                <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-2 text-sm">
                    {data && data?.length > 300
                        ? `${data.slice(0, 300)}...`
                        : data || "No data available"}
                </pre>
                {data && data?.length > 300 && (
                    <button
                        onClick={() => {
                            if (setShowFullData) setShowFullData(!showFullData);
                        }}
                        className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                        {showFullData ? "Show Less" : "Show More"}
                    </button>
                )}
                {showFullData && data && (
                    <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-2 text-sm">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>
            <div className="mt-2">
                <p className="font-medium">Message:</p>
                <p>{message}</p>
            </div>
        </motion.div>
    );
}
