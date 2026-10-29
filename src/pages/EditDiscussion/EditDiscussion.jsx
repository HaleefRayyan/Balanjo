import { useParams } from "react-router-dom"
import DiscussionForm from "../../components/forms/DiscussionForm"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useForumPost } from "../../api/forum"
import { useAuth } from "../../context/auth"
import NotFound from "../NotFound"

// /forum/:id/edit — hanya penulis atau admin (server juga menolak yang lain)
const EditDiscussion = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const { data: post, isPending, isError, error, refetch } = useForumPost(id)

    if (isPending) return <div className="mx-auto max-w-5xl px-5 pt-16"><Loading /></div>
    if (isError && error.status !== 404 && error.status !== 400) return <div className="mx-auto max-w-5xl px-5 pt-16"><ErrorMessage error={error} onRetry={refetch} /></div>
    if (isError || (post.authorId !== user.id && user.role !== "admin")) return <NotFound />

    return <DiscussionForm key={post.id} post={post} />
}

export default EditDiscussion
