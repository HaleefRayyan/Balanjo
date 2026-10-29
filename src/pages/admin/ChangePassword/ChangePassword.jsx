import { useState } from "react"
import PageTitle from "../../../components/admin/PageTitle"
import Button from "../../../components/ui/Button"
import { useChangePassword } from "../../../api/auth"

const fields = [
    { name: "oldPassword", label: "Password Lama" },
    { name: "newPassword", label: "Password Baru" },
    { name: "confirmPassword", label: "Ulang Password Baru" },
]

const MIN_LENGTH = 8

const ChangePassword = () => {
    const [message, setMessage] = useState(null)
    const changePassword = useChangePassword()

    // cek cepat di browser dulu; password lama diperiksa server
    const handleSubmit = (event) => {
        event.preventDefault()
        const formElement = event.currentTarget
        const form = new FormData(formElement)
        const newPassword = form.get("newPassword")

        if (newPassword.length < MIN_LENGTH) {
            setMessage({ type: "error", text: `Password baru minimal ${MIN_LENGTH} karakter.` })
        } else if (newPassword !== form.get("confirmPassword")) {
            setMessage({ type: "error", text: "Ulang password baru tidak sama." })
        } else if (newPassword === form.get("oldPassword")) {
            setMessage({ type: "error", text: "Password baru harus berbeda dari password lama." })
        } else {
            changePassword.mutate({ oldPassword: form.get("oldPassword"), newPassword }, {
                onSuccess: () => {
                    setMessage({ type: "success", text: "Password berhasil diganti." })
                    formElement.reset()
                },
                onError: (error) => setMessage({ type: "error", text: error.message }),
            })
        }
    }

    return (
        <section>
            <PageTitle>Ganti Password</PageTitle>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 rounded-lg bg-white px-5 py-8 sm:px-8">
                    {fields.map((field) => (
                        <label key={field.name} className="flex flex-col gap-2 text-[18px] text-[#a6a6a6]">
                            {field.label}
                            <input
                                type="password"
                                name={field.name}
                                required
                                className="h-12 rounded border border-[#adadad] px-3 text-[16px] text-[#333] outline-none focus:border-button"
                            />
                        </label>
                    ))}
                </div>
                <div className="mt-10 flex items-center justify-end gap-6">
                    {message && (
                        <p role="status" className={`text-[16px] ${message.type === "error" ? "text-red-600" : "text-green-700"}`}>
                            {message.text}
                        </p>
                    )}
                    <Button type="submit" disabled={changePassword.isPending} className="rounded-lg px-10 py-2 text-[20px] disabled:cursor-wait disabled:opacity-60">{changePassword.isPending ? "Menyimpan..." : "Simpan"}</Button>
                </div>
            </form>
        </section>
    )
}

export default ChangePassword
