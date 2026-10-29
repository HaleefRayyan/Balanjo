import { useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import ForumPostCard from "../../components/sections/ForumComp/ForumPostCard"
import Button from "../../components/ui/Button"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import Avatar from "../../components/ui/Avatar"
import { TrashIcon } from "../../components/ui/icons"
import { useAddComment, useDeleteComment, useDeleteForumPost, useForumPost } from "../../api/forum"
import { useAuth } from "../../context/auth"
import { formatShortDate } from "../../utils/format"
import NotFound from "../NotFound"

const ForumDetail = () => {
    const { id } = useParams()
    const location = useLocation()
    const { user } = useAuth()
    const { data: post, isPending, isError, error, refetch } = useForumPost(id)
    const addComment = useAddComment(id)
    const deleteComment = useDeleteComment(id)
    const deletePost = useDeleteForumPost()
    const navigate = useNavigate()
    const [reply, setReply] = useState("")

    if (isPending) return <main className="mx-auto max-w-5xl px-5 pt-16 sm:px-8"><Loading /></main>
    if (isError && (error.status === 404 || error.status === 400)) return <NotFound />
    if (isError) return <main className="mx-auto max-w-5xl px-5 pt-16 sm:px-8"><ErrorMessage error={error} onRetry={refetch} /></main>

    const canManage = (authorId) => user && (user.id === authorId || user.role === "admin")

    const handleDeletePost = () => {
        if (window.confirm("Hapus diskusi ini? Semua balasannya ikut terhapus.")) {
            deletePost.mutate(post.id, {
                onSuccess: () => navigate("/forum", { replace: true }),
                onError: (requestError) => window.alert(requestError.message),
            })
        }
    }

    const handleDeleteComment = (comment) => {
        if (window.confirm("Hapus balasan ini?")) {
            deleteComment.mutate(comment.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const text = reply.trim()
        if (!text) return
        addComment.mutate(text, { onSuccess: () => setReply("") })
    }

    return (
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 lg:pt-16">
            <Link to="/forum" className="text-sm text-button hover:underline">← Kembali ke Forum</Link>

            <div className="mt-6">
                <ForumPostCard post={post} linked={false} />
            </div>
            {canManage(post.authorId) && (
                <div className="mt-3 flex justify-end gap-3 text-sm">
                    <Link to={`/forum/${post.id}/edit`} className="rounded-md border border-button px-4 py-2 text-button hover:bg-button/10">Edit diskusi</Link>
                    <button type="button" onClick={handleDeletePost} disabled={deletePost.isPending} className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
                        {deletePost.isPending ? "Menghapus..." : "Hapus"}
                    </button>
                </div>
            )}

            <section className="mt-8" aria-label="Balasan">
                <h2 className="mb-4 text-lg font-semibold">{post.comments.length} Balasan</h2>
                {post.comments.length === 0 && <p className="text-abu">Belum ada balasan. Jadi yang pertama!</p>}
                <ul className="space-y-3">
                    {post.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-3 rounded-lg bg-white px-4 py-3 sm:ml-12">
                            <Avatar name={comment.author} src={comment.authorAvatar} size="h-9 w-9" textSize="text-sm" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[15px]">
                                    <span className="font-semibold">{comment.author}</span>
                                    <span className="ml-2 text-[13px] text-abu">{formatShortDate(new Date(comment.createdAt))}</span>
                                </p>
                                <p className="mt-1 whitespace-pre-line text-[16px] text-[#222]">{comment.text}</p>
                            </div>
                            {canManage(comment.authorId) && (
                                <button
                                    type="button"
                                    aria-label={`Hapus balasan dari ${comment.author}`}
                                    title="Hapus balasan"
                                    disabled={deleteComment.isPending}
                                    onClick={() => handleDeleteComment(comment)}
                                    className="h-fit cursor-pointer rounded-md p-1 text-abu hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                    <TrashIcon className="h-4.5 w-4.5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                {user ? (
                    <form className="mt-6 sm:ml-12" onSubmit={handleSubmit}>
                        <label htmlFor="reply" className="text-sm text-abu">Tulis balasan sebagai <strong className="text-[#222]">{user.name}</strong></label>
                        <textarea
                            id="reply"
                            value={reply}
                            maxLength={1000}
                            onChange={(event) => setReply(event.target.value)}
                            rows={3}
                            className="mt-2 w-full resize-y rounded-lg border border-[#adadad] bg-white p-3 text-[16px] outline-none focus:border-button"
                        />
                        {addComment.isError && <p role="alert" className="mt-2 text-sm text-red-600">{addComment.error.message}</p>}
                        <div className="mt-3 flex justify-end">
                            <Button type="submit" disabled={!reply.trim() || addComment.isPending} className="rounded-md px-6 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                                {addComment.isPending ? "Mengirim..." : "Kirim"}
                            </Button>
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
