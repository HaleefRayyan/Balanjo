import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { EyeIcon, TrashIcon } from "../../../components/ui/icons"
import { useBlogs, useDeleteBlog } from "../../../api/blogs"
import { formatShortDate } from "../../../utils/format"

const Blogs = () => {
    const { data: blogs, isPending, isError, error, refetch } = useBlogs()
    const deleteBlog = useDeleteBlog()

    const handleDelete = (blog) => {
        if (window.confirm(`Hapus blog "${blog.title}"?`)) {
            deleteBlog.mutate(blog.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "title", header: "Judul Blog", className: "max-w-80", render: (blog) => <span className="line-clamp-2">{blog.title}</span> },
        { key: "category", header: "Kategori", className: "font-medium" },
        { key: "author", header: "Uploader", className: "text-abu" },
        { key: "createdAt", header: "Tanggal Upload", className: "text-abu", render: (blog) => formatShortDate(new Date(blog.createdAt)) },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (blog) => (
                <div className="flex items-center gap-3">
                    <Link to={`/blog/${blog.slug}`} target="_blank" aria-label="Lihat blog" title="Lihat blog" className="rounded-md p-1 text-button hover:bg-button/10">
                        <EyeIcon />
                    </Link>
                    <IconButton label="Hapus blog" disabled={deleteBlog.isPending} onClick={() => handleDelete(blog)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Kelola Blog</PageTitle>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={blogs} emptyText="Belum ada blog." />
            )}
        </section>
    )
}

export default Blogs
