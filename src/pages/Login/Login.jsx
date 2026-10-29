import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth"

const Login = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { login } = useAuth()
	const [error, setError] = useState("")
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		setError("")
		setSubmitting(true)
		try {
			const user = await login({ email: form.get("email"), password: form.get("password") })
			const home = user.role === "admin" ? "/admin" : "/"
			navigate(location.state?.from?.pathname || home, { replace: true })
		} catch (loginError) {
			setError(loginError.message)
			setSubmitting(false)
		}
	}

	return (
		<>
			<h1 className="text-center text-[20px] font-semibold text-[#333] sm:text-[21px]">Login</h1>

			<form className="mt-10 flex flex-1 flex-col" onSubmit={handleSubmit}>
				<label className="text-[16px] text-[#222]" htmlFor="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="your email address"
					className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
				/>

				<div className="mt-10 flex items-center justify-between gap-4">
					<label className="text-[16px] text-[#222]" htmlFor="password">Password</label>
					<Link className="text-[16px] text-[#42a5e9] hover:underline" to="/forgot-password">I forgot my password</Link>
				</div>
				<input
					id="password"
					name="password"
					type="password"
					required
					placeholder="your password"
					className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
				/>

				{error && <p role="alert" className="mt-4 text-[14px] text-red-600">{error}</p>}

				<button className="mx-auto mt-10 h-18 w-37.25 rounded-[10px] bg-black text-[18px] font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>
					{submitting ? "Signing in..." : "Sign in"}
				</button>

				<div className="mt-12 border-t border-[#dedede] pt-10">
					<div className="flex flex-wrap items-center justify-center gap-6 text-[16px] text-[#222]">
						<span>Don’t have an account?</span>
						<Link className="flex h-15.75 w-42.75 items-center justify-center rounded-[10px] border border-[#999] font-semibold transition-colors hover:bg-text" to="/register">
							Register
						</Link>
					</div>
				</div>
			</form>
		</>
	)
}

export default Login
