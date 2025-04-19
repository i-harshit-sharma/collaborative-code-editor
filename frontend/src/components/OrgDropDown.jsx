import { ArrowRight, BellDot, Book, ChevronDown, FileQuestion, FunnelX, Globe, MessageCircleQuestion } from "lucide-react"
import { Button } from "../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useState } from "react"
// import { DropdownMenuCheckboxItem } from "@radix-ui/react-dropdown-menu"

function OrgDropDown({ isOpen }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className={`flex items-center justify-between gap-2 h-full hover:bg-dark-1 cursor-pointer px-4 ${isOpen ? "w-50 border-r-1 border-dark-1" : ""}`}>
                    <div className="flex items-center gap-2">
                        <span className=" bg-[#2b3245] p-2 rounded-full text-[10px] size-6 flex items-center justify-center border-1 border-dark-1 text-gray-400 select-none">HS</span>
                        <span className="text-[14px] text-gray-300 select-none">231210047</span>
                    </div>
                    <span className="text-[14px] text-gray-300 ">
                        <ChevronDown className="size-4" />
                    </span>
                </span>

            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-4 w-56 bg-dark-2 border-dark-3" scrollbar="false" sideOffset={5}>
                <DropdownMenuLabel>Switch Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-dark-3" />
                <DropdownMenuLabel className="text-xs text-gray-400">Personal Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem checked={true} className="hover:bg-dark-1 cursor-pointer">
                        231210047 (you)
                        <DropdownMenuShortcut></DropdownMenuShortcut>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-gray-400">Switch Organization</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem checked={true} className="hover:bg-dark-1 cursor-pointer">
                        Organization 1
                        <DropdownMenuShortcut></DropdownMenuShortcut>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem className="hover:bg-dark-1 cursor-pointer">
                        Organization 2
                        <DropdownMenuShortcut></DropdownMenuShortcut>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem className="hover:bg-dark-1 cursor-pointer">
                        Organization 3
                        <DropdownMenuShortcut></DropdownMenuShortcut>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator className="bg-dark-3" />
                    <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer" >Join an Organization</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-dark-3" />
                    <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer" >Create an Organization</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
function NotificationDropDown({ notifications, setNotifications }) {
    const [notificationMode, setNotificationMode] = useState("unread")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={`p-1.5 hover:bg-dark-1 rounded cursor-pointer focus:outline-none focus:ring-0 ${notifications.filter(notification => notification.status === "unread").length > 0 ? "text-red-400" : ""}`} >
                    <BellDot size={18} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 mr-4 bg-dark-4 border-dark-3" sideOffset={5}>
                <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                        <span className="text-lg">Notifications</span>
                        <Link to="/notifications" className="flex items-center gap-2 border-1 border-dark-1 px-2 py-0.5 hover:bg-dark-2 cursor-pointer rounded text-xs">View All <ArrowRight size={16} /></Link>

                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-dark-3" />
                <DropdownMenuLabel>
                    <div className="w-full flex bg-dark-1">
                        <div className={`w-1/2 flex items-center justify-center rounded h-8 cursor-pointer select-none ${notificationMode === "unread" ? "bg-[#0053a6]" : ""}`} onClick={() => setNotificationMode(() => "unread")}>Unread</div>
                        <div className={`w-1/2 flex items-center justify-center rounded h-8 cursor-pointer select-none ${notificationMode === "all" ? "bg-[#0053a6]" : ""}`} onClick={() => setNotificationMode(() => "all")}>All</div>
                    </div>
                </DropdownMenuLabel>
                {notifications.map((notification, index) => {
                    // Decide whether to render the notification based on the notificationMode.
                    // If notificationMode is "all", or the notification's status matches the mode, render it.
                    if (notificationMode === "all" || notification.status === notificationMode) {
                        return (
                            <DropdownMenuItem
                                key={index}
                                className={`flex items-center justify-between gap-2 hover:bg-dark-1 cursor-pointer ${notification.status === "read" ? "text-gray-400" : ""}`}
                                onClick={() => setNotifications(index)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm">{notification.title}</span>
                                    <span className="text-xs text-gray-400">{notification.description}</span>
                                </div>
                                <div className="flex flex-col">
                                    {notification.status === "unread" && (
                                        <span className="bg-blue-400 w-2 h-2 rounded-full"></span>
                                    )}
                                    <span className="text-xs text-gray-400">{notification.time}</span>
                                </div>
                            </DropdownMenuItem>
                        );
                    }
                    return null;
                })}

            </DropdownMenuContent>
        </DropdownMenu>
        // <p>Hi</p>
    )
}

function HelpDropDown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-dark-1 rounded cursor-pointer focus:outline-none focus:ring-0 ">
                    <FileQuestion size={18} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 mr-4 bg-dark-4 border-dark-3" sideOffset={5}>
                <DropdownMenuLabel className="text-lg">Help</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-dark-3" />
                <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full "></span>
                        <span className="text-sm">All Systems Operational</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Book />
                        <span className="text-sm">Documentation</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                        <MessageCircleQuestion />
                        <span className="text-sm">get help</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-dark-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Globe />
                        <span className="text-sm">Feedback</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export { OrgDropDown, NotificationDropDown, HelpDropDown }
