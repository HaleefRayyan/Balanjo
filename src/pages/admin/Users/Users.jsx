import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { TrashIcon } from "../../../components/ui/icons"
import { useAdminUsers, useDeleteUser } from "../../../api/admin"
import { useAuth } from "../../../context/auth"
import { formatShortDate } from "../../../utils/format"

const userCode = (id) => `US${String(id).padStart(6, "0")}`

const Users = () => {
    const { user: currentUser } = useAuth()
    const { data: users, isPending, isError, error, refetch } = useAdminUsers()
    const deleteUser = useDeleteUser()

    const handleDelete = (user) => {
        if (window.confirm(`Hapus user ${user.name}? Semua blog, diskusi, dan pesanannya ikut terhapus.`)) {
            deleteUser.mutate(user.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "id", header: "User ID", className: "text-abu", render: (user) => userCode(user.id) },
        { key: "name", header: "Nama", className: "font-medium", render: (user) => <>{user.name}{user.role === "admin" && <span className="ml-2 rounded bg-button/15 px-1.5 py-0.5 text-xs text-button">admin</span>}</> },
        { key: "username", header: "username", className: "font-medium" },
        { key: "email", header: "Email", className: "text-abu" },
        { key: "joinedAt", header: "Tanggal Bergabung", className: "text-abu", render: (user) => formatShortDate(new Date(user.joinedAt)) },
        {
            key: "actions",
            header: "Aksi",
            render: (user) => user.id === currentUser?.id ? null : (
                <IconButton label={`Hapus ${user.name}`} disabled={deleteUser.isPending} onClick={() => handleDelete(user)}>
                    <TrashIcon />
                </IconButton>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>User</PageTitle>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={users} emptyText="Belum ada user." />
            )}
        </section>
    )
}

export default Users
