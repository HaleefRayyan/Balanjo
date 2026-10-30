import { Link } from "react-router-dom"
import DataTable from "../../components/admin/DataTable"
import IconButton from "../../components/admin/IconButton"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { EditIcon, EyeIcon, TrashIcon } from "../../components/ui/icons"
import { useDeleteForumPost, useForumPosts } from "../../api/forum"
import { useAuth } from "../../context/auth"
import { formatLongDate } from "../../utils/format"
import ProfileCard from "./ProfileCard"

// Desain "Kelola Forum": No, Judul, Tanggal, Jumlah Balasan, Kategori, Aksi
const MyPosts = () => {
    const { user } = useAuth()
    const { data: posts, isPending, isError, error, refetch } = useForumPosts({ authorId: user.id })
    const deletePost = useDeleteForumPost()

    const handleDelete = (post) => {
        if (window.confirm(`Hapus diskusi "${post.text}"? Semua balasannya ikut terhapus.`)) {
            deletePost.mutate(post.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "text", header: "Judul Forum", className: "max-w-72", render: (post) => <span className="line-clamp-2">{post.text}</span> },
        { key: "createdAt", header: "Tanggal", className: "whitespace-nowrap text-abu", render: (post) => formatLongDate(new Date(post.createdAt)) },
        { key: "commentCount", header: "Jumlah Balasan", className: "text-abu", render: (post) => post.commentCount || "–" },
        { key: "category", header: "Kategori" },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (post) => (
                <div className="flex items-center gap-2">
                    <Link to={`/forum/${post.id}`} aria-label={`Lihat ${post.text}`} title="Lihat" className="rounded-md p-1 text-button hover:bg-button/10"><EyeIcon className="h-5 w-5" /></Link>
                    <Link to={`/profile/forums/${post.id}/edit`} aria-label={`Edit ${post.text}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10"><EditIcon className="h-5 w-5" /></Link>
                    <IconButton label={`Hapus ${post.text}`} disabled={deletePost.isPending} onClick={() => handleDelete(post)}><TrashIcon className="h-5 w-5" /></IconButton>
                </div>
            ),
        },
    ]

    return (
        <ProfileCard
            title="Kelola Forum"
            action={<Link to="/forum/new" className="rounded-md bg-button px-4 py-1.5 text-sm text-white hover:bg-[#896d26]">+ Mulai Diskusi</Link>}
        >
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={posts} emptyText="Kamu belum memulai diskusi." />
            )}
        </ProfileCard>
    )
}

export default MyPosts
