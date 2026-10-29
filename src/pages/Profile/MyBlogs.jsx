import { Link } from "react-router-dom"
import { Empty, ErrorMessage, Loading } from "../../components/ui/Status"
import { EditIcon, TrashIcon } from "../../components/ui/icons"
import { useBlogs, useDeleteBlog } from "../../api/blogs"
import { useAuth } from "../../context/auth"
import { formatShortDate } from "../../utils/format"

const MyBlogs = () => {
    const { user } = useAuth()
    const { data: blogs, isPending, isError, error, refetch } = useBlogs({ authorId: user.id })
    const deleteBlog = useDeleteBlog()

    const handleDelete = (blog) => {
        if (window.confirm(`Hapus artikel "${blog.title}"?`)) {
            deleteBlog.mutate(blog.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    if (isPending) return <Loading />
    if (isError) return <ErrorMessage error={error} onRetry={refetch} />

    return (
        <section>
            <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-abu">{blogs.length} artikel</p>
                <Link to="/blog/new" className="rounded-lg bg-button px-5 py-2.5 text-white hover:bg-[#896d26]">+ Tulis Artikel</Link>
            </div>
            {blogs.length === 0 ? <Empty text="Kamu belum menulis artikel." /> : (
                <ul className="divide-y divide-[#eee] rounded-lg bg-white">
                    {blogs.map((blog) => (
                        <li key={blog.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                            <div className="min-w-0 flex-1">
                                <Link to={`/blog/${blog.slug}`} className="font-medium hover:text-button">{blog.title}</Link>
                                <p className="text-sm text-abu">{blog.category} · {formatShortDate(new Date(blog.createdAt))}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={`/blog/${blog.slug}/edit`} aria-label={`Edit ${blog.title}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10"><EditIcon /></Link>
                                <button type="button" aria-label={`Hapus ${blog.title}`} title="Hapus" disabled={deleteBlog.isPending} onClick={() => handleDelete(blog)} className="cursor-pointer rounded-md p-1 text-button hover:bg-button/10 disabled:opacity-50"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default MyBlogs
