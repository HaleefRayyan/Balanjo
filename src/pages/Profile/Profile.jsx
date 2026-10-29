import { useSearchParams } from "react-router-dom"
import ProfileForm from "./ProfileForm"
import MyBlogs from "./MyBlogs"
import MyPosts from "./MyPosts"
import ChangePasswordForm from "../../components/forms/ChangePasswordForm"

const AccountTab = () => (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="mb-4 text-lg font-semibold">Data Profil</h2>
            <ProfileForm />
        </section>
        <section aria-labelledby="password-heading">
            <h2 id="password-heading" className="mb-4 text-lg font-semibold">Ganti Password</h2>
            <ChangePasswordForm />
        </section>
    </div>
)

const tabs = [
    { key: "account", label: "Profil", component: AccountTab },
    { key: "blogs", label: "Artikel Saya", component: MyBlogs },
    { key: "posts", label: "Diskusi Saya", component: MyPosts },
]

const Profile = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const active = tabs.find((tab) => tab.key === searchParams.get("tab")) ?? tabs[0]
    const ActiveTab = active.component

    return (
        <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8">
            <div className="mb-6 flex items-center gap-3 text-button">
                <span className="h-0.75 w-16 bg-button" />
                <h1 className="text-2xl font-semibold sm:text-3xl">Profil Saya</h1>
            </div>

            <div role="tablist" aria-label="Menu profil" className="mb-8 flex gap-6 overflow-x-auto border-b border-line">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={tab.key === active.key}
                        onClick={() => setSearchParams(tab.key === "account" ? {} : { tab: tab.key })}
                        className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 pb-3 text-[16px] transition-colors ${tab.key === active.key ? "border-button font-semibold text-button" : "border-transparent text-abu hover:text-button"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <ActiveTab />
        </main>
    )
}

export default Profile
