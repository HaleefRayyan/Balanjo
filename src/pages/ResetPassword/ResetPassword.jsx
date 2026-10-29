import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useResetPassword } from "../../api/auth"

const inputClass = "mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"

// Dibuka dari link di email reset: /reset-password?token=...
const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") ?? ""
    const resetPassword = useResetPassword()
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        if (form.get("password") !== form.get("confirmPassword")) {
            setError("Password dan Re-type Password tidak sama.")
            return
        }
        setError("")
        resetPassword.mutate({ token, password: form.get("password") }, {
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <>
            <h1 className="text-center text-[20px] font-semibold text-[#333] sm:text-[21px]">Set a new password</h1>

            {resetPassword.isSuccess ? (
                <p className="mt-10 text-center text-[16px] text-[#222]">Your password has been changed. You can sign in with your new password.</p>
            ) : !token ? (
                <p className="mt-10 text-center text-[16px] text-red-600">This reset link is incomplete. Request a new one from the login page.</p>
            ) : (
                <form className="mt-10 flex flex-col" onSubmit={handleSubmit}>
                    <label className="text-[16px] text-[#222]" htmlFor="new-password">New Password</label>
                    <input id="new-password" name="password" type="password" required minLength={8} placeholder="at least 8 characters" className={inputClass} />
                    <label className="mt-7 text-[16px] text-[#222]" htmlFor="confirm-new-password">Re-type Password</label>
                    <input id="confirm-new-password" name="confirmPassword" type="password" required minLength={8} placeholder="your password" className={inputClass} />
                    {error && <p role="alert" className="mt-4 text-[14px] text-red-600">{error}</p>}
                    <button className="mx-auto mt-10 h-18 rounded-[10px] bg-black px-6 text-[18px] font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={resetPassword.isPending}>
                        {resetPassword.isPending ? "Saving..." : "Save password"}
                    </button>
                </form>
            )}

            <div className="mt-12 border-t border-[#dedede] pt-10">
                <div className="flex flex-wrap items-center justify-center gap-6 text-[16px] text-[#222]">
                    <span>{resetPassword.isSuccess ? "Ready?" : "Remember your password?"}</span>
                    <Link className="flex h-15.75 w-42.75 items-center justify-center rounded-[10px] border border-[#999] font-semibold transition-colors hover:bg-text" to="/login">
                        Sign in
                    </Link>
                </div>
            </div>
        </>
    )
}

export default ResetPassword
