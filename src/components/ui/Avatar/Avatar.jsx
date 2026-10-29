// Foto profil, atau inisial nama kalau belum ada foto. size: kelas ukuran Tailwind.
const Avatar = ({ name = "", src, size = "h-10 w-10", textSize = "text-base", className = "" }) => {
    if (src) return <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover ${className}`} />
    return (
        <span aria-hidden="true" className={`${size} ${textSize} flex shrink-0 items-center justify-center rounded-full bg-[#64708A] font-medium text-white ${className}`}>
            {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
    )
}

export default Avatar
