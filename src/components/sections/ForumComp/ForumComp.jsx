import SectionHeader from "../../ui/SectionHeader"
import Button from "../../ui/Button"
import messageIcon from "../../../assets/forum/message.svg"
import profilePeapole from "../../../assets/forum/profilePeapole.svg"
import { forumCategories, forumPosts, trendingTopics } from "../../../data/forum"

const ForumComp = ({ showHeader = false })=>{
    return <section className="px-5 pb-20 sm:px-8 lg:px-[97.32px] lg:pb-30">
        {showHeader && <SectionHeader
            category="Forum"
            label ="Mari Berdiskusi Dengan Para Rangers"
            ket ="Tempat di mana ide-ide segar bertemu dengan pengetahuan mendalam
                untuk membantu mengembangkan bisnis kamu"
            to='/forum'
        />}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <aside className="order-2 lg:order-1">
                <Button className="h-12 w-full rounded-lg text-base">Mulai Diskusi Baru</Button>

                <div className="mt-8">
                    <h3 className="mb-4 text-base text-abu">Kategori</h3>
                    <ul className="space-y-4">
                        {forumCategories.map((category) => (
                            <li className="flex items-center gap-3 text-base" key={category.label}>
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                                {category.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-9">
                    <h3 className="mb-4 text-base text-abu">Trending</h3>
                    <ul>
                        {trendingTopics.map(([title, continuation, replies]) => (
                            <li className="border-b border-[#E7E7E7] py-3 first:pt-0" key={title}>
                                <p className="text-base leading-[1.2]">{title}<br />{continuation}</p>
                                <span className="mt-1 block text-base text-button">{replies}</span>
                            </li>
                        ))}
                    </ul>
                    <button className="mt-3 text-base text-button" type="button">+ Lihat Semua</button>
                </div>
            </aside>

            <div className="order-1 space-y-5 lg:order-2">
                {forumPosts.map((post) => (
                    <article className="relative min-h-24 rounded-lg bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] sm:px-5" key={post.id}>
                        <div className="flex gap-3">
                                    <div className="w-12 shrink-0">
                                        <img
                                            className="h-auto w-12 object-contain object-top"
                                            src={post.line || post.profile}
                                            alt="Profil pengguna"
                                        />
                                        {post.people && <img className="mt-2 h-auto w-12 object-contain" src={profilePeapole} alt="Profil pengguna lain" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                                <p className="text-[20px] font-semibold leading-tight">{post.author}</p>
                                                <p className="mt-1 text-[20px] leading-tight text-[#222]">{post.text}</p>
                                    </div>
                                            <span className="shrink-0 rounded-full border border-[#E8E8E8] px-3 py-1 text-[14px] text-[#777]">
                                        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: post.color }} />
                                        {post.category}
                                    </span>
                                </div>
                                        {post.image && <img className="mt-3 h-auto max-h-55 w-full max-w-[320px] object-cover" src={post.image} alt="Gedung kampus" />}
                                        <div className="mt-4 flex items-center gap-4 text-[14px] text-[#888]">
                                            <img className="h-5 w-5" src={messageIcon} alt="Komentar" />
                                    {post.replies && <span>{post.replies}</span>}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
}

export default ForumComp