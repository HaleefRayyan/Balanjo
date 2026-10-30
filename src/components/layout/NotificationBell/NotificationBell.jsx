import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/auth"
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../../api/notifications"
import { formatRelative } from "../../../utils/format"

const BellIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a6 6 0 0 0-6 6v3.6l-1.7 3.4A1 1 0 0 0 5.2 16.5h13.6a1 1 0 0 0 .9-1.5L18 11.6V8a6 6 0 0 0-6-6Zm-2.8 16a3 3 0 0 0 5.6 0H9.2Z" />
    </svg>
)

// Lonceng notifikasi (navbar, Seller Centre, Profil, Admin). Klik item -> tandai dibaca & buka tautannya.
const NotificationBell = ({ className = "text-black" }) => {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const { data } = useNotifications(Boolean(user))
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()
    const [panel, setPanel] = useState({ path: "", open: false })
    const isOpen = panel.open && panel.path === location.pathname

    if (!user) return null
    const unread = data?.unread ?? 0
    const notifications = data?.notifications ?? []

    const handleOpen = (notification) => {
        if (!notification.read) markRead.mutate(notification.id)
        setPanel({ path: "", open: false })
        if (notification.link) navigate(notification.link)
    }

    return (
        <div className="relative">
            <button
                type="button"
                aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
                aria-expanded={isOpen}
                onClick={() => setPanel({ path: location.pathname, open: !isOpen })}
                className={`relative flex cursor-pointer items-center ${className}`}
            >
                <BellIcon />
                {unread > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>
            {isOpen && (
                // HP: selebar layar di bawah topbar; layar lebih besar: menempel di bawah lonceng
                <div className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-lg bg-white text-left shadow-lg ring-1 ring-black/5 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-88">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <p className="text-sm font-semibold text-[#333]">Notifikasi</p>
                        {unread > 0 && (
                            <button type="button" onClick={() => markAllRead.mutate()} className="cursor-pointer text-xs text-button hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>
                    <ul className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-abu">Belum ada notifikasi.</li>}
                        {notifications.map((notification) => (
                            <li key={notification.id} className="border-b border-line last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => handleOpen(notification)}
                                    className={`flex w-full cursor-pointer gap-3 px-4 py-3 text-left hover:bg-background ${notification.read ? "" : "bg-[#fbf7ec]"}`}
                                >
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-transparent" : "bg-button"}`} aria-hidden="true" />
                                    <span className="min-w-0">
                                        <span className={`block text-sm ${notification.read ? "text-[#555]" : "font-semibold text-[#222]"}`}>{notification.title}</span>
                                        <span className="mt-0.5 line-clamp-2 block text-xs text-[#666]">{notification.body}</span>
                                        <span className="mt-1 block text-[11px] text-abu">{formatRelative(new Date(notification.createdAt))}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
