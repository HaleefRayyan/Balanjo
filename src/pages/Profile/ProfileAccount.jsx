import { useState } from "react"
import Button from "../../components/ui/Button"
import { useChangePassword, useRemoveAvatar, useUpdateProfile } from "../../api/auth"
import { useAuth } from "../../context/auth"
import ProfileCard from "./ProfileCard"

const inputClass = "h-10 rounded border border-[#d0d0d0] px-3 text-[14px] text-[#333] outline-none placeholder:text-[#aaa] focus:border-button"
const labelClass = "flex flex-col gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#555]"
const MIN_PASSWORD = 8

// Desain "Akun": Account Details + Password dalam satu form dengan satu tombol "Save changes".
// Password hanya diganti kalau salah satu kolom password diisi.
const ProfileAccount = () => {
    const { user } = useAuth()
    const updateProfile = useUpdateProfile()
    const changePassword = useChangePassword()
    const removeAvatar = useRemoveAvatar()
    const [message, setMessage] = useState(null)
    const saving = updateProfile.isPending || changePassword.isPending

    const handleSubmit = async (event) => {
        event.preventDefault()
        const formElement = event.currentTarget
        const form = new FormData(formElement)
        const oldPassword = form.get("oldPassword")
        const newPassword = form.get("newPassword")
        const repeatPassword = form.get("repeatPassword")
        const wantsPassword = Boolean(oldPassword || newPassword || repeatPassword)

        if (wantsPassword) {
            if (!oldPassword) return setMessage({ type: "error", text: "Isi password lama untuk mengganti password." })
            if (newPassword.length < MIN_PASSWORD) return setMessage({ type: "error", text: `Password baru minimal ${MIN_PASSWORD} karakter.` })
            if (newPassword !== repeatPassword) return setMessage({ type: "error", text: "Ulang password baru tidak sama." })
        }

        setMessage(null)
        try {
            await updateProfile.mutateAsync({
                firstName: form.get("firstName"),
                lastName: form.get("lastName"),
                name: form.get("name"),
                email: form.get("email"),
                emailNotifications: form.get("emailNotifications") === "on",
            })
            if (wantsPassword) {
                await changePassword.mutateAsync({ oldPassword, newPassword })
                for (const name of ["oldPassword", "newPassword", "repeatPassword"]) formElement.elements[name].value = ""
            }
            setMessage({ type: "success", text: wantsPassword ? "Profil dan password disimpan." : "Profil disimpan." })
        } catch (error) {
            setMessage({ type: "error", text: error.message })
        }
    }

    return (
        <ProfileCard className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h1 className="text-[17px] font-semibold text-black">Account Details</h1>
                <label className={labelClass}>
                    First name *
                    <input name="firstName" required maxLength={40} defaultValue={user.firstName ?? user.name} placeholder="First name" autoComplete="given-name" className={`${inputClass} normal-case tracking-normal`} />
                </label>
                <label className={labelClass}>
                    Last name
                    <input name="lastName" maxLength={40} defaultValue={user.lastName ?? ""} placeholder="Last name" autoComplete="family-name" className={`${inputClass} normal-case tracking-normal`} />
                </label>
                <label className={labelClass}>
                    Display name *
                    <input name="name" required maxLength={80} defaultValue={user.name} placeholder="Display name" autoComplete="nickname" className={`${inputClass} normal-case tracking-normal`} />
                    <span className="text-[11px] font-normal normal-case italic tracking-normal text-abu">Nama ini yang tampil di akunmu, artikel, diskusi, dan ulasan.</span>
                </label>
                <label className={labelClass}>
                    Email *
                    <input name="email" type="email" required defaultValue={user.email} placeholder="Email" autoComplete="email" className={`${inputClass} normal-case tracking-normal`} />
                </label>
                {user.avatar && (
                    <button type="button" disabled={removeAvatar.isPending} onClick={() => removeAvatar.mutate()} className="w-fit cursor-pointer text-sm text-red-600 hover:underline disabled:opacity-60">
                        Hapus foto profil
                    </button>
                )}

                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#555]">
                    <input name="emailNotifications" type="checkbox" defaultChecked={user.emailNotifications} className="h-4 w-4 accent-button" />
                    Kirim notifikasi pesanan, payout, dan ulasan ke email saya
                </label>

                <h2 className="mt-4 text-[17px] font-semibold text-black">Password</h2>
                <label className={labelClass}>
                    Old password
                    <input name="oldPassword" type="password" placeholder="Old password" autoComplete="current-password" className={`${inputClass} normal-case tracking-normal`} />
                </label>
                <label className={labelClass}>
                    New password
                    <input name="newPassword" type="password" placeholder="New password" autoComplete="new-password" className={`${inputClass} normal-case tracking-normal`} />
                </label>
                <label className={labelClass}>
                    Repeat new password
                    <input name="repeatPassword" type="password" placeholder="Repeat new password" autoComplete="new-password" className={`${inputClass} normal-case tracking-normal`} />
                </label>

                {message && <p role="status" className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>{message.text}</p>}
                <Button type="submit" disabled={saving} className="mt-1 w-fit rounded-md px-6 py-2 text-[14px] disabled:cursor-wait disabled:opacity-60">
                    {saving ? "Menyimpan..." : "Save changes"}
                </Button>
            </form>
        </ProfileCard>
    )
}

export default ProfileAccount
