import { useParams } from "react-router-dom"
import ArticleForm from "../../components/forms/ArticleForm"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useBlog } from "../../api/blogs"
import { useAuth } from "../../context/auth"
import NotFound from "../NotFound"

// /blog/:slug/edit — hanya penulis atau admin (server juga menolak yang lain)
const EditArtikel = () => {
    const { slug } = useParams()
    const { user } = useAuth()
    const { data: blog, isPending, isError, error, refetch } = useBlog(slug)

    if (isPending) return <div className="mx-auto max-w-5xl px-5 pt-16"><Loading /></div>
    if (isError && error.status !== 404) return <div className="mx-auto max-w-5xl px-5 pt-16"><ErrorMessage error={error} onRetry={refetch} /></div>
    if (isError || (blog.authorId !== user.id && user.role !== "admin")) return <NotFound />

    return <ArticleForm key={blog.id} blog={blog} />
}

export default EditArtikel
