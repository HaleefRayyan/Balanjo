import DOMPurify from "dompurify"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useBlog, useDeleteBlog } from "../../api/blogs"
import Avatar from "../../components/ui/Avatar"
import { useAuth } from "../../context/auth"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { formatDateTime } from "../../utils/format"
import NotFound from "../NotFound"

const DetailBlog = () => {
    const { slug } = useParams()
    const { data: blog, isPending, isError, error, refetch } = useBlog(slug)
    const { user } = useAuth()
    const navigate = useNavigate()
    const deleteBlog = useDeleteBlog()

    if (isPending) return <div className="mx-auto max-w-327.5 px-6 pt-16"><Loading /></div>
    if (isError && error.status === 404) return <NotFound />
    if (isError) return <div className="mx-auto max-w-327.5 px-6 pt-16"><ErrorMessage error={error} onRetry={refetch} /></div>

    const canManage = user && (user.id === blog.authorId || user.role === "admin")
    const handleDelete = () => {
        if (window.confirm(`Hapus artikel "${blog.title}"?`)) {
            deleteBlog.mutate(blog.id, {
                onSuccess: () => navigate("/blog", { replace: true }),
                onError: (requestError) => window.alert(requestError.message),
            })
        }
    }

    return <section className="font-roboto text-[#111]">

        <header className="bg-background px-6 pb-12 pt-25 sm:px-12 lg:pt-12 lg:px-[8.5%]">
            <div className="mx-auto max-w-327.5">
                <span className="inline-block rounded bg-[#f4eddb] px-2 py-1 text-[14px] text-button">{blog.category}</span>
                <h1 className="mt-5 text-[40px] font-bold leading-[1.15] text-[#062653]">
                    {blog.title}
                </h1>
                <div className="mt-4 flex flex-col gap-1 text-[22px] text-[#24518b]">
                    <span>{formatDateTime(new Date(blog.createdAt))}</span>
                    <span className="flex items-center gap-2 text-[#062653]">
                        {blog.authorAvatar && <Avatar name={blog.author} src={blog.authorAvatar} size="h-8 w-8" />}
                        by {blog.author}
                    </span>
                </div>
                {canManage && (
                    <div className="mt-5 flex gap-3 font-inter text-sm">
                        <Link to={`/profile/blogs/${blog.slug}/edit`} className="rounded-md border border-button px-4 py-2 text-button hover:bg-button/10">Edit artikel</Link>
                        <button type="button" onClick={handleDelete} disabled={deleteBlog.isPending} className="cursor-pointer rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
                            {deleteBlog.isPending ? "Menghapus..." : "Hapus"}
                        </button>
                    </div>
                )}
            </div>
        </header>

        <main className="mx-auto max-w-327.5 px-6 pb-24 pt-9 sm:px-10 lg:px-0">
            {blog.cover && <img className="mx-auto h-auto w-185.75 max-w-full" src={blog.cover} alt="" />}
            {/* sudah disanitasi server; DOMPurify sebagai lapisan pengaman kedua */}
            <article
                className="rich-text mt-12 text-justify text-[20px] font-light leading-snug tracking-[0.04em]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.body) }}
            />
        </main>
    </section>
}

export default DetailBlog
