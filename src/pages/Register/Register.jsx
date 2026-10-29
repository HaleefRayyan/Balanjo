import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth"
import heroBg from "../../assets/Hero/heroBg.png"

const fields = [
    { id: "full-name", name: "fullName", type: "text", label: "Full Name", placeholder: "your full name" },
    { id: "register-email", name: "email", type: "email", label: "Email", placeholder: "your email address" },
    { id: "register-password", name: "password", type: "password", label: "Password", placeholder: "your password" },
    { id: "confirm-password", name: "confirmPassword", type: "password", label: "Re-type Password", placeholder: "your password" },
]

const Register = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [error, setError] = useState("")

    const handleSubmit = (event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        if (form.get("password") !== form.get("confirmPassword")) {
            setError("Password dan Re-type Password tidak sama.")
            return
        }
        login({ name: form.get("fullName"), email: form.get("email") })
        navigate("/", { replace: true })
    }

    return (
        <main
            className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-8"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(160, 131, 54, 0.8) 0%, rgba(160, 131, 54, 0.2) 100%), url(${heroBg})`,
            }}
        >
            <section className="flex w-full max-w-211 flex-col rounded-[10px] bg-white px-8 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:px-16 sm:py-9 lg:px-[81.5px]">
                <h1 className="text-center text-[20px] font-semibold text-[#333] sm:text-[21px]">Register</h1>

                <form className="mt-8 flex flex-1 flex-col" onSubmit={handleSubmit}>
                    {fields.map((field, index) => (
                        <div key={field.id} className={index > 0 ? "mt-7" : undefined}>
                            <label className="text-[16px] text-[#222]" htmlFor={field.id}>{field.label}</label>
                            <input
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                required
                                placeholder={field.placeholder}
                                className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
                            />
                        </div>
                    ))}

                    {error && <p role="alert" className="mt-4 text-[14px] text-red-600">{error}</p>}

                    <button className="mx-auto mt-10 h-18 rounded-[10px] bg-black px-6 text-[18px] font-semibold text-white transition-opacity hover:opacity-80" type="submit">
                        Create Account
                    </button>

                    <div className="mt-12 border-t border-[#dedede] pt-10">
                        <div className="flex flex-wrap items-center justify-center gap-6 text-[16px] text-[#222]">
                            <span>Already have an account?</span>
                            <Link className="flex h-15.75 w-42.75 items-center justify-center rounded-[10px] border border-[#999] font-semibold transition-colors hover:bg-text" to="/login">
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
