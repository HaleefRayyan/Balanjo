import { Link } from "react-router-dom"
import { Empty, ErrorMessage, Loading } from "../../components/ui/Status"
import { EditIcon, TrashIcon } from "../../components/ui/icons"
import { useDeleteForumPost, useForumPosts } from "../../api/forum"
import { useAuth } from "../../context/auth"
import { formatShortDate } from "../../utils/format"

const MyPosts = () => {
    const { user } = useAuth()
    const { data: posts, isPending, isError, error, refetch } = useForumPosts({ authorId: user.id })
    const deletePost = useDeleteForumPost()

    const handleDelete = (post) => {
        if (window.confirm(`Hapus diskusi "${post.text}"? Semua balasannya ikut terhapus.`)) {
            deletePost.mutate(post.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    if (isPending) return <Loading />
    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    return (
        <section>
            <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-abu">{posts.length} diskusi</p>
                <Link to="/forum/new" className="rounded-lg bg-button px-5 py-2.5 text-white hover:bg-[#896d26]">+ Mulai Diskusi</Link>
            </div>
            {posts.length === 0 ? <Empty text="Kamu belum memulai diskusi." /> : (
                <ul className="divide-y divide-[#eee] rounded-lg bg-white">
                    {posts.map((post) => (
                        <li key={post.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                            <div className="min-w-0 flex-1">
                                <Link to={`/forum/${post.id}`} className="font-medium hover:text-button">{post.text}</Link>
                                <p className="text-sm text-abu">{post.category} · {post.commentCount} balasan · {formatShortDate(new Date(post.createdAt))}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={`/forum/${post.id}/edit`} aria-label={`Edit ${post.text}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10"><EditIcon /></Link>
                                <button type="button" aria-label={`Hapus ${post.text}`} title="Hapus" disabled={deletePost.isPending} onClick={() => handleDelete(post)} className="cursor-pointer rounded-md p-1 text-button hover:bg-button/10 disabled:opacity-50"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default MyPosts
