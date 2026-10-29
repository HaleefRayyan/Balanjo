import { useRef, useState } from "react"
import Avatar from "../../components/ui/Avatar"
import Button from "../../components/ui/Button"
import { useRemoveAvatar, useUpdateProfile, useUploadAvatar } from "../../api/auth"
import { useAuth } from "../../context/auth"

const fieldClass = "h-12 rounded border border-[#adadad] px-3 text-[16px] text-[#333] outline-none focus:border-button"

const ProfileForm = () => {
    const { user } = useAuth()
    const updateProfile = useUpdateProfile()
    const uploadAvatar = useUploadAvatar()
    const removeAvatar = useRemoveAvatar()
    const fileInput = useRef(null)
    const [message, setMessage] = useState(null)

    const showError = (error) => setMessage({ type: "error", text: error.message })

    // foto langsung diunggah begitu dipilih
    const handleAvatar = (event) => {
        const file = event.target.files[0]
        event.target.value = "" // supaya file yang sama bisa dipilih lagi
        if (!file) return
        const formData = new FormData()
        formData.set("image", file)
        uploadAvatar.mutate(formData, {
            onSuccess: () => setMessage({ type: "success", text: "Foto profil diperbarui." }),
            onError: showError,
        })
    }

    const handleRemoveAvatar = () => {
        removeAvatar.mutate(undefined, {
            onSuccess: () => setMessage({ type: "success", text: "Foto profil dihapus." }),
            onError: showError,
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        updateProfile.mutate({ name: form.get("name"), email: form.get("email") }, {
            onSuccess: () => setMessage({ type: "success", text: "Profil disimpan." }),
            onError: showError,
        })
    }

    const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg bg-white px-5 py-8 sm:px-8">
            <div className="flex flex-wrap items-center gap-5">
                <Avatar name={user.name} src={user.avatar} size="h-20 w-20" textSize="text-3xl" />
                <div className="flex flex-wrap gap-3">
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatar} aria-label="Pilih foto profil" />
                    <button type="button" disabled={avatarBusy} onClick={() => fileInput.current.click()} className="cursor-pointer rounded-md border border-button px-4 py-2 text-sm text-button hover:bg-button/10 disabled:cursor-wait disabled:opacity-60">
                        {uploadAvatar.isPending ? "Mengunggah..." : user.avatar ? "Ganti foto" : "Unggah foto"}
                    </button>
                    {user.avatar && (
                        <button type="button" disabled={avatarBusy} onClick={handleRemoveAvatar} className="cursor-pointer rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
                            Hapus foto
                        </button>
                    )}
                </div>
            </div>

            <label className="flex flex-col gap-2 text-[16px] text-[#a6a6a6]">
                Nama
                <input name="name" required maxLength={80} defaultValue={user.name} autoComplete="name" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-2 text-[16px] text-[#a6a6a6]">
                Email
                <input name="email" type="email" required defaultValue={user.email} autoComplete="email" className={fieldClass} />
            </label>
            <p className="-mt-3 text-sm text-abu">Username: <span className="text-[#555]">{user.username}</span></p>

            <div className="flex flex-wrap items-center justify-end gap-6">
                {message && (
                    <p role="status" className={`text-[15px] ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>{message.text}</p>
                )}
                <Button type="submit" disabled={updateProfile.isPending} className="rounded-lg px-8 py-2 text-[16px] disabled:cursor-wait disabled:opacity-60">
                    {updateProfile.isPending ? "Menyimpan..." : "Simpan Profil"}
                </Button>
            </div>
        </form>
    )
}

export default ProfileForm
