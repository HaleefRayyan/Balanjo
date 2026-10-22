// Ikon SVG sederhana untuk panel admin, mengikuti warna teks (currentColor)

export const DashboardIcon = ({ className = "h-7 w-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2a10 10 0 0 0-8.66 15A2 2 0 0 0 5.07 18h13.86a2 2 0 0 0 1.73-1A10 10 0 0 0 12 2Zm3.7 5.3a1 1 0 0 1 .2 1.1l-2.5 5.5a2 2 0 1 1-1.8-.85l2.5-5.5a1 1 0 0 1 1.6-.25Z" clipRule="evenodd" />
    </svg>
)

export const UserIcon = ({ className = "h-7 w-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="7" r="4.5" />
        <path d="M3.5 20.5C3.5 16.4 7.3 14 12 14s8.5 2.4 8.5 6.5c0 .8-.7 1.5-1.5 1.5H5c-.8 0-1.5-.7-1.5-1.5Z" />
    </svg>
)

export const FolderGearIcon = ({ className = "h-7 w-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v3.3A6 6 0 0 0 12.3 20H4a2 2 0 0 1-2-2V6Z" />
        <path fillRule="evenodd" d="M18 13a1 1 0 0 1 1 .8l.1.6.6.3.5-.4a1 1 0 0 1 1.3.1l.1.1a1 1 0 0 1 .1 1.3l-.4.5.3.6.6.1a1 1 0 0 1 .8 1v.2a1 1 0 0 1-.8 1l-.6.1-.3.6.4.5a1 1 0 0 1-.1 1.3l-.1.1a1 1 0 0 1-1.3.1l-.5-.4-.6.3-.1.6a1 1 0 0 1-1 .8h-.2a1 1 0 0 1-1-.8l-.1-.6-.6-.3-.5.4a1 1 0 0 1-1.3-.1l-.1-.1a1 1 0 0 1-.1-1.3l.4-.5-.3-.6-.6-.1a1 1 0 0 1-.8-1v-.2a1 1 0 0 1 .8-1l.6-.1.3-.6-.4-.5a1 1 0 0 1 .1-1.3l.1-.1a1 1 0 0 1 1.3-.1l.5.4.6-.3.1-.6a1 1 0 0 1 1-.8h.2Zm-.1 3.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" clipRule="evenodd" />
    </svg>
)

export const TrashIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5V3h4.5a1 1 0 1 1 0 2h-15a1 1 0 0 1 0-2H9v-.5Z" />
        <path fillRule="evenodd" d="M5.5 7h13l-1 13.2A2 2 0 0 1 15.5 22h-7a2 2 0 0 1-2-1.8L5.5 7Zm4 3a1 1 0 0 0-1 1.1l.5 6a1 1 0 0 0 2-.2l-.5-6a1 1 0 0 0-1-.9Zm5 0a1 1 0 0 0-1 .9l-.5 6a1 1 0 0 0 2 .2l.5-6a1 1 0 0 0-1-1.1Z" clipRule="evenodd" />
    </svg>
)

export const EyeIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 5C6.5 5 2.7 9.2 1.4 11.1a1.6 1.6 0 0 0 0 1.8C2.7 14.8 6.5 19 12 19s9.3-4.2 10.6-6.1a1.6 1.6 0 0 0 0-1.8C21.3 9.2 17.5 5 12 5Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 1.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" clipRule="evenodd" />
    </svg>
)

export const EditIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
        <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" fill="currentColor" />
    </svg>
)

export const ChevronDownIcon = ({ className = "h-5 w-5" }) => (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 6l5 5 5-5" />
    </svg>
)

export const MenuIcon = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
)
