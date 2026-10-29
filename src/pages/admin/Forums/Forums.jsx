import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { EyeIcon, TrashIcon } from "../../../components/ui/icons"
import { useDeleteForumPost, useForumPosts } from "../../../api/forum"
import { formatShortDate } from "../../../utils/format"

const Forums = () => {
    const { data: posts, isPending, isError, error, refetch } = useForumPosts()
    const deletePost = useDeleteForumPost()

    const handleDelete = (post) => {
        if (window.confirm(`Hapus forum "${post.text}"?`)) {
            deletePost.mutate(post.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "text", header: "Judul Forum", className: "max-w-80" },
        { key: "category", header: "Kategori", className: "font-medium" },
        { key: "author", header: "Uploader", className: "text-abu" },
        { key: "commentCount", header: "Balasan", className: "text-abu" },
        { key: "createdAt", header: "Tanggal Upload", className: "text-abu", render: (post) => formatShortDate(new Date(post.createdAt)) },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (post) => (
                <div className="flex items-center gap-3">
                    <Link to={`/forum/${post.id}`} target="_blank" aria-label="Lihat forum" title="Lihat forum" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon />
                    </Link>
                    <IconButton label="Hapus forum" disabled={deletePost.isPending} onClick={() => handleDelete(post)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Kelola Forum</PageTitle>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={posts} emptyText="Belum ada forum." />
            )}
        </section>
    )
}

export default Forums
