import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth"
import heroBg from "../../assets/Hero/heroBg.png"

const Register = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    return (
        <main
            className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-8"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(160, 131, 54, 0.8) 0%, rgba(160, 131, 54, 0.2) 100%), url(${heroBg})`,
            }}
        >
            <section className="flex min-h-142.5 w-full max-w-155 flex-col rounded-[10px] bg-white px-8 py-7 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:px-12 sm:py-8">
                <h1 className="text-center text-[20px] font-semibold text-[#333]">Register</h1>

                <form className="mt-7 flex flex-1 flex-col" onSubmit={(event) => {
                    event.preventDefault()
        const form = new FormData(event.currentTarget)
        login({ name: form.get("fullName"), email: form.get("email") })
        navigate("/", { replace: true })
                }}>
                    <label className="text-[13px] text-[#222]" htmlFor="full-name">Full Name</label>
                    <input
                        id="full-name"
                        name="fullName"
                        type="text"
                        placeholder="your full name"
                        className="mt-1 h-10 w-full rounded-[5px] border border-[#c9c9c9] px-4 text-[13px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                    />

                    <label className="mt-5 text-[13px] text-[#222]" htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        placeholder="your email address"
                        className="mt-1 h-10 w-full rounded-[5px] border border-[#c9c9c9] px-4 text-[13px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                    />

                    <label className="mt-5 text-[13px] text-[#222]" htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        required
                        placeholder="your password"
                        className="mt-1 h-10 w-full rounded-[5px] border border-[#c9c9c9] px-4 text-[13px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                    />

                    <label className="mt-5 text-[13px] text-[#222]" htmlFor="confirm-password">Re-type Password</label>
                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="your password"
                        className="mt-1 h-10 w-full rounded-[5px] border border-[#c9c9c9] px-4 text-[13px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                    />

                    <button className="mx-auto mt-7 h-10 rounded-md bg-black px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-80" type="submit">
                        Create Account
                    </button>

                    <div className="mt-8 border-t border-[#dedede] pt-6">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-[#222]">
                            <span>Already have an account?</span>
                            <Link className="flex h-9 w-24 items-center justify-center rounded-[5px] border border-[#999] font-semibold transition-colors hover:bg-text" to="/login">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default Register
