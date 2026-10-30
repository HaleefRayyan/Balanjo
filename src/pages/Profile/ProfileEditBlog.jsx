import { Link, useParams } from "react-router-dom"
import ArticleForm from "../../components/forms/ArticleForm"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useBlog } from "../../api/blogs"
import { useAuth } from "../../context/auth"
import NotFound from "../NotFound"

// /profile/blogs/:slug/edit — hanya penulis atau admin (server juga menolak yang lain)
const ProfileEditBlog = () => {
    const { slug } = useParams()
    const { user } = useAuth()
    const { data: blog, isPending, isError, error, refetch } = useBlog(slug)

    if (isPending) return <Loading />
    if (isError && error.status !== 404) return <ErrorMessage error={error} onRetry={refetch} />
    if (isError || (blog.authorId !== user.id && user.role !== "admin")) return <NotFound />

    return (
        <>
            <Link to="/profile/blogs" className="mb-4 inline-block text-sm text-button hover:underline">← Kembali ke Kelola Blog</Link>
            <ArticleForm key={blog.id} blog={blog} embedded returnTo="/profile/blogs" />
        </>
    )
}

export default ProfileEditBlog
