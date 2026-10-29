import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { EyeIcon, TrashIcon } from "../../../components/ui/icons"
import { useContent } from "../../../context/content"

const Blogs = () => {
    const { blogs, removeBlog } = useContent()

    const handleDelete = (blog) => {
        if (window.confirm(`Hapus blog "${blog.title}"?`)) {
            removeBlog(blog.id)
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "title", header: "Judul Blog", className: "max-w-80", render: (blog) => <span className="line-clamp-2">{blog.title}</span> },
        { key: "category", header: "Kategori", className: "font-medium" },
        { key: "author", header: "Uploader", className: "text-abu" },
        { key: "date", header: "Tanggal Upload", className: "text-abu" },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (blog) => (
                <div className="flex items-center gap-3">
                    <Link to={`/blog/${blog.slug}`} target="_blank" aria-label="Lihat blog" title="Lihat blog" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon />
                    </Link>
                    <IconButton label="Hapus blog" onClick={() => handleDelete(blog)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Kelola Blog</PageTitle>
            <DataTable columns={columns} rows={blogs} emptyText="Belum ada blog." />
        </section>
    )
}

export default Blogs
