import { useRef } from "react"
import PanelLayout from "../components/layout/PanelLayout"
import Avatar from "../components/ui/Avatar"
import { CameraIcon } from "../components/ui/icons"
import { useUploadAvatar } from "../api/auth"
import { useAuth } from "../context/auth"

const menu = [
    { label: "Akun", to: "/profile", end: true },
    { label: "Riwayat Pesanan", to: "/profile/orders" },
    { label: "Kelola Blog", to: "/profile/blogs" },
    { label: "Kelola Forum", to: "/profile/forums" },
]

// Foto + nama di atas menu; klik foto untuk menggantinya (ikon kamera seperti di desain)
const ProfileHeader = () => {
    const { user } = useAuth()
    const uploadAvatar = useUploadAvatar()
    const fileInput = useRef(null)

    const handleFile = (event) => {
        const file = event.target.files[0]
        event.target.value = ""
        if (!file) return
        const formData = new FormData()
        formData.set("image", file)
        uploadAvatar.mutate(formData, { onError: (error) => window.alert(error.message) })
    }

    return (
        <div className="mb-10 flex flex-col items-center gap-2 px-4 text-center">
            <button
                type="button"
                title="Ganti foto profil"
                aria-label="Ganti foto profil"
                disabled={uploadAvatar.isPending}
                onClick={() => fileInput.current.click()}
                className="relative cursor-pointer rounded-full disabled:cursor-wait disabled:opacity-60"
            >
                <Avatar name={user?.name} src={user?.avatar} size="h-16 w-16" textSize="text-2xl" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#333] text-white">
                    <CameraIcon className="h-3 w-3" />
                </span>
            </button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} aria-label="Pilih foto profil" />
            <p className="text-[14px] font-semibold text-black">{user?.name}</p>
        </div>
    )
}

const LogoutFooter = () => {
    const { logout } = useAuth()
    return (
        <div className="flex justify-center py-8">
            <button type="button" onClick={() => logout("/")} className="cursor-pointer rounded-md bg-button px-6 py-1.5 text-[15px] font-medium text-white hover:bg-[#896d26]">
                Logout
            </button>
        </div>
    )
}

const ProfileLayout = () => (
    <PanelLayout
        menu={menu}
        menuLabel="menu profil"
        activeStyle="bold"
        sidebarHeader={<ProfileHeader />}
        sidebarFooter={<LogoutFooter />}
    />
)

export default ProfileLayout
