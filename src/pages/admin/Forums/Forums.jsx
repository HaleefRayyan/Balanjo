import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { EyeIcon, TrashIcon } from "../../../components/ui/icons"
import { useContent } from "../../../context/content"

const Forums = () => {
    const { forumPosts: posts, removeForumPost } = useContent()

    const handleDelete = (post) => {
        if (window.confirm(`Hapus forum "${post.text}"?`)) {
            removeForumPost(post.id)
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "text", header: "Judul Forum", className: "max-w-80" },
        { key: "category", header: "Kategori", className: "font-medium" },
        { key: "author", header: "Uploader", className: "text-abu" },
        { key: "replies", header: "Balasan", className: "text-abu", render: (post) => post.comments.length },
        { key: "date", header: "Tanggal Upload", className: "text-abu" },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (post) => (
                <div className="flex items-center gap-3">
                    <Link to={`/forum/${post.id}`} target="_blank" aria-label="Lihat forum" title="Lihat forum" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon />
                    </Link>
                    <IconButton label="Hapus forum" onClick={() => handleDelete(post)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Kelola Forum</PageTitle>
            <DataTable columns={columns} rows={posts} emptyText="Belum ada forum." />
        </section>
    )
}

export default Forums
