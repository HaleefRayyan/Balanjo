import { useState } from "react"
import { Link } from "react-router-dom"
import { useForgotPassword } from "../../api/auth"

const ForgotPassword = () => {
    const [sentTo, setSentTo] = useState("")
    const forgotPassword = useForgotPassword()

    // Server selalu menjawab sukses (tidak membocorkan email mana yang terdaftar)
    const handleSubmit = (event) => {
        event.preventDefault()
        const email = new FormData(event.currentTarget).get("email")
        forgotPassword.mutate(email, { onSuccess: () => setSentTo(email) })
    }

    return (
        <>
            <h1 className="text-center text-[20px] font-semibold text-[#333] sm:text-[21px]">Reset Password</h1>

            {sentTo ? (
                <div className="mt-10 text-center text-[16px] text-[#222]">
                    <p>If an account exists for <strong>{sentTo}</strong>, we've sent a link to reset your password.</p>
                    <p className="mt-2 text-abu">Check your inbox and spam folder.</p>
                </div>
            ) : (
                <form className="mt-10 flex flex-col" onSubmit={handleSubmit}>
                    <p className="mb-8 text-[16px] text-abu">Enter the email you registered with and we'll send you a link to reset your password.</p>
                    <label className="text-[16px] text-[#222]" htmlFor="reset-email">Email</label>
                    <input
                        id="reset-email"
                        name="email"
                        type="email"
                        required
                        placeholder="your email address"
                        className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                    />
                    {forgotPassword.isError && <p role="alert" className="mt-4 text-[14px] text-red-600">{forgotPassword.error.message}</p>}
                    <button className="mx-auto mt-10 h-18 rounded-[10px] bg-black px-6 text-[18px] font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={forgotPassword.isPending}>
                        {forgotPassword.isPending ? "Sending..." : "Send reset link"}
                    </button>
                </form>
            )}

            <div className="mt-12 border-t border-[#dedede] pt-10">
                <div className="flex flex-wrap items-center justify-center gap-6 text-[16px] text-[#222]">
                    <span>Remember your password?</span>
                    <Link className="flex h-15.75 w-42.75 items-center justify-center rounded-[10px] border border-[#999] font-semibold transition-colors hover:bg-text" to="/login">
                        Sign in
                    </Link>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword
