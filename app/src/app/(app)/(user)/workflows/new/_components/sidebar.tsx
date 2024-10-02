import { ZapIcon,LinkIcon, TagIcon, WebhookIcon, TimerIcon, UploadIcon, CalendarIcon as SchedulerIcon, MoreVerticalIcon, GitBranchIcon, EditIcon, WorkflowIcon } from "lucide-react"; // Icons

export function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
    if (!sidebarOpen) return null;

    return (
        <div className="w-[400px] bg-white shadow-lg p-4 absolute pb-8 top-0 my-8 right-8 overflow-y-auto rounded-lg hover:shadow-xl transition-all duration-200 ease-in-out">
            {/* Improved Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                   <WorkflowIcon/> <h4 className="font-bold text-md">Workflows</h4>
                </div>
                <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
            </div>

            {/* Tabs with improved design */}
            <div className="flex gap-4 mb-4 border-b border-gray-200 pb-2">
                <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1">Objects</button>
                <button className="text-sm font-semibold text-gray-500 pb-1">Templates</button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for objects"
                    className="w-full p-2 border rounded-md"
                />
            </div>

            {/* Logic and Actions with reduced card size */}
            <h5 className="font-semibold mb-2">Logic</h5>
            <div className="space-y-2 mb-4">
                {/* Logic Cards */}
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-md mr-2">
                            <ZapIcon className="text-yellow-500" />
                        </div>
                        <div>
                            <span>If / Else</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-md mr-2">
                            <GitBranchIcon className="text-yellow-500" />
                        </div>
                        <div>
                            <span>Multi-Branch</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
            </div>

            <h5 className="font-semibold mb-2">Actions</h5>
            <div className="space-y-2">
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-md mr-2">
                            <LinkIcon className="text-purple-500" />
                        </div>
                        <div>
                            <span>Redirect to URL</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="bg-purple-100 p-2 rounded-md mr-2">
                        <TagIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Tag</span>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="bg-purple-100 p-2 rounded-md mr-2">
                        <WebhookIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Webhook</span>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="bg-purple-100 p-2 rounded-md mr-2">
                        <TimerIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Wait</span>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="bg-purple-100 p-2 rounded-md mr-2">
                        <UploadIcon className="text-purple-500" />
                    </div>
                    <div>
                        <span>Send Data</span>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
            </div>

            <h5 className="font-semibold mb-2 mt-4">Scheduling</h5>
            <div className="space-y-2">
                <div className="flex items-center p-3 border rounded-md bg-white shadow-sm justify-between">
                    <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-md mr-2">
                            <SchedulerIcon className="text-gray-500" />
                        </div>
                        <div>
                            <span>Display Scheduler</span>
                        </div>
                    </div>
                    <MoreVerticalIcon className="text-gray-500 cursor-pointer" />
                </div>
            </div>
        </div>
    );
}
