import {
    ZapIcon,
    LinkIcon,
    TagIcon,
    WebhookIcon,
    TimerIcon,
    UploadIcon,
    CalendarIcon as SchedulerIcon,
    MoreVerticalIcon,
    GitBranchIcon,
    EditIcon,
    WorkflowIcon,
} from "lucide-react"; // Icons

export function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
    if (!sidebarOpen) return null;

    return (
        <div className="absolute right-8 top-0 my-8 w-[400px] overflow-y-auto rounded-lg bg-white p-4 pb-8 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl">
            {/* Improved Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                    <WorkflowIcon />{" "}
                    <h4 className="text-md font-bold">Workflows</h4>
                </div>
                <MoreVerticalIcon className="cursor-pointer text-gray-500" />
            </div>

            {/* Tabs with improved design */}
            <div className="mb-4 flex gap-4 border-b border-gray-200 pb-2">
                <button className="border-b-2 border-blue-600 pb-1 text-sm font-semibold text-blue-600">
                    Objects
                </button>
                <button className="pb-1 text-sm font-semibold text-gray-500">
                    Templates
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for objects"
                    className="w-full rounded-md border p-2"
                />
            </div>

            {/* Logic and Actions with reduced card size */}
            <h5 className="mb-2 font-semibold">Logic</h5>
            <div className="mb-4 space-y-2">
                {/* Logic Cards */}
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center">
                        <div className="mr-2 rounded-md bg-yellow-100 p-2">
                            <ZapIcon className="text-yellow-500" />
                        </div>
                        <div>
                            <span>If / Else</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center">
                        <div className="mr-2 rounded-md bg-yellow-100 p-2">
                            <GitBranchIcon className="text-yellow-500" />
                        </div>
                        <div>
                            <span>Multi-Branch</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
            </div>

            <h5 className="mb-2 font-semibold">Actions</h5>
            <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center">
                        <div className="mr-2 rounded-md bg-purple-100 p-2">
                            <LinkIcon className="text-purple-500" />
                        </div>
                        <div>
                            <span>Redirect to URL</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="mr-2 rounded-md bg-purple-100 p-2">
                        <TagIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Tag</span>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="mr-2 rounded-md bg-purple-100 p-2">
                        <WebhookIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Webhook</span>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="mr-2 rounded-md bg-purple-100 p-2">
                        <TimerIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Wait</span>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="mr-2 rounded-md bg-purple-100 p-2">
                        <UploadIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Send Data</span>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
            </div>

            <h5 className="mb-2 mt-4 font-semibold">Scheduling</h5>
            <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center">
                        <div className="mr-2 rounded-md bg-gray-100 p-2">
                            <SchedulerIcon className="text-gray-500" />
                        </div>
                        <div>
                            <span>Display Scheduler</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="cursor-pointer text-gray-500" />
                </div>
            </div>
        </div>
    );
}
