import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import SectionHeader from "../../ui/SectionHeader"
import Button from "../../ui/Button"
import ForumPostCard from "./ForumPostCard"
import { Empty, ErrorMessage, Loading } from "../../ui/Status"
import { forumCategories } from "../../../constants/categories"
import { useForumPosts } from "../../../api/forum"

const TRENDING_COUNT = 4

// Filter kategori lewat ?category= (hanya berlaku di halaman /forum; di Get Started selalu semua)
const ForumComp = ({ showHeader = false, limit })=>{
    const { data: forumPosts = [], isPending, isError, error, refetch } = useForumPosts()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [showAllTrending, setShowAllTrending] = useState(false)

    const activeCategory = showHeader ? null : searchParams.get("category")
    const filtered = activeCategory ? forumPosts.filter((post) => post.category === activeCategory) : forumPosts
    const visiblePosts = limit ? filtered.slice(0, limit) : filtered

    const byReplies = [...forumPosts].sort((a, b) => b.commentCount - a.commentCount)
    const trending = showAllTrending ? byReplies : byReplies.slice(0, TRENDING_COUNT)

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
                <Button className="h-12 w-full rounded-lg text-base" onClick={() => navigate("/forum/new")}>Mulai Diskusi Baru</Button>

                <div className="mt-8">
                    <h3 className="mb-4 text-base text-abu">Kategori</h3>
                    <ul className="space-y-4">
                        {forumCategories.map((category) => {
                            const isActive = category.label === activeCategory
                            return (
                                <li key={category.label}>
                                    <Link
                                        // klik kategori yang aktif lagi untuk menghapus filter
                                        to={isActive ? "/forum" : `/forum?category=${encodeURIComponent(category.label)}`}
                                        aria-current={isActive ? "true" : undefined}
                                        className={`flex items-center gap-3 text-base hover:text-button ${isActive ? "font-semibold text-button" : ""}`}
                                    >
                                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                                        {category.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <div className="mt-9">
                    <h3 className="mb-4 text-base text-abu">Trending</h3>
                    <ul>
                        {trending.map((post) => (
                            <li className="border-b border-[#E7E7E7] py-3 first:pt-0" key={post.id}>
                                <Link to={`/forum/${post.id}`} className="block hover:text-button">
                                    <p className="text-base leading-[1.2]">{post.text}</p>
                                    <span className="mt-1 block text-base text-button">{post.commentCount} balasan</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {byReplies.length > TRENDING_COUNT && (
                        <button className="mt-3 cursor-pointer text-base text-button" type="button" onClick={() => setShowAllTrending((value) => !value)}>
                            {showAllTrending ? "− Tampilkan Sedikit" : "+ Lihat Semua"}
                        </button>
                    )}
                </div>
            </aside>

            <div className="order-1 space-y-5 lg:order-2">
                {activeCategory && (
                    <p className="text-sm text-abu">
                        Menampilkan kategori <strong className="text-[#222]">{activeCategory}</strong> ·{" "}
                        <Link to="/forum" className="text-button hover:underline">Hapus filter</Link>
                    </p>
                )}
                {isPending && <Loading />}
                {isError && <ErrorMessage error={error} onRetry={refetch} />}
                {!isPending && !isError && visiblePosts.length === 0 && <Empty text="Belum ada diskusi di kategori ini." />}
                {visiblePosts.map((post) => <ForumPostCard key={post.id} post={post} />)}
                {limit && filtered.length > limit && (
                    <Link to="/forum" className="block text-center text-button hover:underline">Lihat semua diskusi</Link>
                )}
            </div>
        </div>
    </section>
}

export default ForumComp
