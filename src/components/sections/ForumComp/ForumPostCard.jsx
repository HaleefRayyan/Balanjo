import { Link } from "react-router-dom"
import messageIcon from "../../../assets/forum/message.svg"
import profileHighLine from "../../../assets/forum/profileHighLine.png"
import profileMidLine from "../../../assets/forum/profileMidLine.png"
import profileNoLine from "../../../assets/forum/profileNoLine.png"
import profilePeapole from "../../../assets/forum/profilePeapole.svg"
import { categoryColor } from "../../../constants/categories"
import { formatShortDate } from "../../../utils/format"

// Avatar dengan garis menuju avatar pembalas: garis panjang untuk post bergambar, pendek kalau ada balasan
const avatarFor = (post) => {
    if (post.commentCount === 0) return profileNoLine
    return post.image ? profileHighLine : profileMidLine
}

// linked: judul jadi link ke halaman detail (dimatikan di halaman detail itu sendiri)
const ForumPostCard = ({ post, linked = true }) => {
    const replyCount = post.commentCount
    const title = <p className="mt-1 text-[20px] leading-tight text-[#222]">{post.text}</p>

    return (
        <article className="relative min-h-24 rounded-lg bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] sm:px-5">
            <div className="flex gap-3">
                <div className="w-12 shrink-0">
                    <img className="h-auto w-12 object-contain object-top" src={avatarFor(post)} alt="Profil pengguna" />
                    {replyCount > 0 && <img className="mt-2 h-auto w-12 object-contain" src={profilePeapole} alt="Profil pengguna lain" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[20px] font-semibold leading-tight">{post.author}</p>
                            {linked ? <Link to={`/forum/${post.id}`} className="hover:text-button">{title}</Link> : title}
                        </div>
                        <Link
                            to={`/forum?category=${encodeURIComponent(post.category)}`}
                            className="shrink-0 rounded-full border border-[#E8E8E8] px-3 py-1 text-[14px] text-[#777] hover:border-button"
                        >
                            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColor(post.category) }} />
                            {post.category}
                        </Link>
                    </div>
                    {post.image && <img className="mt-3 h-auto max-h-55 w-full max-w-[320px] object-cover" src={post.image} alt="" />}
                    <div className="mt-4 flex items-center gap-4 text-[14px] text-[#888]">
                        {linked ? (
                            <Link to={`/forum/${post.id}`} className="flex items-center gap-4 hover:text-button">
                                <img className="h-5 w-5" src={messageIcon} alt="Komentar" />
                                <span>{replyCount > 0 ? `${replyCount} balasan` : "Balas"}</span>
                            </Link>
                        ) : (
                            <>
                                <img className="h-5 w-5" src={messageIcon} alt="Komentar" />
                                <span>{replyCount} balasan</span>
                            </>
                        )}
                        <span className="ml-auto">{formatShortDate(new Date(post.createdAt))}</span>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default ForumPostCard
