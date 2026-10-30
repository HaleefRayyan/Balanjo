import { Link, useParams } from "react-router-dom"
import DiscussionForm from "../../components/forms/DiscussionForm"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useForumPost } from "../../api/forum"
import { useAuth } from "../../context/auth"
import NotFound from "../NotFound"

// /profile/forums/:id/edit — hanya penulis atau admin (server juga menolak yang lain)
const ProfileEditPost = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const { data: post, isPending, isError, error, refetch } = useForumPost(id)

    if (isPending) return <Loading />
    if (isError && error.status !== 404 && error.status !== 400) return <ErrorMessage error={error} onRetry={refetch} />
    if (isError || (post.authorId !== user.id && user.role !== "admin")) return <NotFound />

    return (
        <>
            <Link to="/profile/forums" className="mb-4 inline-block text-sm text-button hover:underline">← Kembali ke Kelola Forum</Link>
            <DiscussionForm key={post.id} post={post} embedded returnTo="/profile/forums" />
        </>
    )
}

export default ProfileEditPost
