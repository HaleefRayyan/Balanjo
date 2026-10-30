import { Link } from "react-router-dom"
import DataTable from "../../components/admin/DataTable"
import IconButton from "../../components/admin/IconButton"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { EditIcon, EyeIcon, TrashIcon } from "../../components/ui/icons"
import { useBlogs, useDeleteBlog } from "../../api/blogs"
import { useAuth } from "../../context/auth"
import { formatLongDate } from "../../utils/format"
import ProfileCard from "./ProfileCard"

// Desain "Kelola Blog": No, Judul Blog, Tanggal, Kategori, Aksi
const MyBlogs = () => {
    const { user } = useAuth()
    const { data: blogs, isPending, isError, error, refetch } = useBlogs({ authorId: user.id })
    const deleteBlog = useDeleteBlog()

    const handleDelete = (blog) => {
        if (window.confirm(`Hapus artikel "${blog.title}"?`)) {
            deleteBlog.mutate(blog.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "no", header: "No", className: "text-abu", render: (_, index) => index + 1 },
        { key: "title", header: "Judul Blog", className: "max-w-72", render: (blog) => <span className="line-clamp-2">{blog.title}</span> },
        { key: "createdAt", header: "Tanggal", className: "whitespace-nowrap text-abu", render: (blog) => formatLongDate(new Date(blog.createdAt)) },
        { key: "category", header: "Kategori" },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (blog) => (
                <div className="flex items-center gap-2">
                    <Link to={`/blog/${blog.slug}`} aria-label={`Lihat ${blog.title}`} title="Lihat" className="rounded-md p-1 text-button hover:bg-button/10"><EyeIcon className="h-5 w-5" /></Link>
                    <Link to={`/profile/blogs/${blog.slug}/edit`} aria-label={`Edit ${blog.title}`} title="Edit" className="rounded-md p-1 text-button hover:bg-button/10"><EditIcon className="h-5 w-5" /></Link>
                    <IconButton label={`Hapus ${blog.title}`} disabled={deleteBlog.isPending} onClick={() => handleDelete(blog)}><TrashIcon className="h-5 w-5" /></IconButton>
                </div>
            ),
        },
    ]

    return (
        <ProfileCard
            title="Kelola Blog"
            action={<Link to="/blog/new" className="rounded-md bg-button px-4 py-1.5 text-sm text-white hover:bg-[#896d26]">+ Tulis Artikel</Link>}
        >
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={blogs} emptyText="Kamu belum menulis artikel." />
            )}
        </ProfileCard>
    )
}

export default MyBlogs
