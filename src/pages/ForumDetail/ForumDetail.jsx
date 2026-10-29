import { useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import ForumPostCard from "../../components/sections/ForumComp/ForumPostCard"
import Button from "../../components/ui/Button"
import profileNoLine from "../../assets/forum/profileNoLine.png"
import { useAuth } from "../../context/auth"
import { useContent } from "../../context/content"
import NotFound from "../NotFound"

const ForumDetail = () => {
    const { id } = useParams()
    const location = useLocation()
    const { user } = useAuth()
    const { forumPosts, addComment } = useContent()
    const [reply, setReply] = useState("")
    const post = forumPosts.find((item) => item.id === Number(id))

    if (!post) return <NotFound />

    const handleSubmit = (event) => {
        event.preventDefault()
        const text = reply.trim()
        if (!text) return
        addComment(post.id, { author: user.name, text })
        setReply("")
    }

    return (
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 lg:pt-16">
            <Link to="/forum" className="text-sm text-button hover:underline">← Kembali ke Forum</Link>

            <div className="mt-6">
                <ForumPostCard post={post} linked={false} />
            </div>

            <section className="mt-8" aria-label="Balasan">
                <h2 className="mb-4 text-lg font-semibold">{post.comments.length} Balasan</h2>
                {post.comments.length === 0 && <p className="text-abu">Belum ada balasan. Jadi yang pertama!</p>}
                <ul className="space-y-3">
                    {post.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-3 rounded-lg bg-white px-4 py-3 sm:ml-12">
                            <img src={profileNoLine} alt="" className="h-9 w-9 shrink-0 object-contain object-top" />
                            <div className="min-w-0">
                                <p className="text-[15px]">
                                    <span className="font-semibold">{comment.author}</span>
                                    <span className="ml-2 text-[13px] text-abu">{comment.date}</span>
                                </p>
                                <p className="mt-1 text-[16px] text-[#222]">{comment.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                {user ? (
                    <form className="mt-6 sm:ml-12" onSubmit={handleSubmit}>
                        <label htmlFor="reply" className="text-sm text-abu">Tulis balasan sebagai <strong className="text-[#222]">{user.name}</strong></label>
                        <textarea
                            id="reply"
                            value={reply}
                            onChange={(event) => setReply(event.target.value)}
                            rows={3}
                            className="mt-2 w-full resize-y rounded-lg border border-[#adadad] bg-white p-3 text-[16px] outline-none focus:border-button"
                        />
                        <div className="mt-3 flex justify-end">
                            <Button type="submit" disabled={!reply.trim()} className="rounded-md px-6 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">Kirim</Button>
                        </div>
                    </form>
                ) : (
                    <p className="mt-6 rounded-lg bg-white px-4 py-4 text-center text-abu sm:ml-12">
                        <Link to="/login" state={{ from: location }} className="text-button hover:underline">Login</Link> untuk ikut berdiskusi.
                    </p>
                )}
            </section>
        </main>
    )
}

export default ForumDetail
