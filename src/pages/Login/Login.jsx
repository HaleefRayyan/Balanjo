import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/auth"
import heroBg from "../../assets/Hero/heroBg.png"

const Login = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { login } = useAuth()

	return (
		<main
			className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-8"
			style={{
				backgroundImage: `linear-gradient(180deg, rgba(160, 131, 54, 0.8) 0%, rgba(160, 131, 54, 0.2) 100%), url(${heroBg})`,
			}}
		>
			<section className="flex min-h-178.75 w-full max-w-211 flex-col rounded-[10px] bg-white px-8 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:px-16 sm:py-9 lg:px-[81.5px]">
				<h1 className="text-center text-[20px] font-semibold text-[#333] sm:text-[21px]">Login</h1>

				<form className="mt-10 flex flex-1 flex-col" onSubmit={(event) => {
					event.preventDefault()
		const form = new FormData(event.currentTarget)
		login({ email: form.get("email") })
		navigate(location.state?.from?.pathname || "/", { replace: true })
				}}>
					<label className="text-[16px] text-[#222]" htmlFor="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="your email address"
						className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
					/>

					<div className="mt-10">
						<label className="text-[16px] text-[#222]" htmlFor="password">Password</label>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="your password"
						className="mt-2 h-18 w-full rounded-[10px] border border-[#c9c9c9] px-5 text-[16px] text-[#333] outline-none placeholder:text-[#999] focus:border-button"
					/>
					<div className="mt-3 flex justify-end">
						<a className="text-[16px] text-[#42a5e9] hover:underline" href="#forgot-password">I forgot my password</a>
					</div>

					<button className="mx-auto mt-10 h-18 w-37.25 rounded-[10px] bg-black text-[18px] font-semibold text-white transition-opacity hover:opacity-80" type="submit">
						Sign in
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
			</section>
		</main>
	)
}

export default Login