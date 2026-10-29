import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import { TrashIcon } from "../../../components/ui/icons"
import initialUsers from "../../../data/users"

const Users = () => {
    const [users, setUsers] = useState(initialUsers)

    const handleDelete = (user) => {
        if (window.confirm(`Hapus user ${user.name}?`)) {
            setUsers((current) => current.filter((item) => item.id !== user.id))
        }
    }

    const columns = [
        { key: "id", header: "User ID", className: "text-abu" },
        { key: "name", header: "Nama", className: "font-medium" },
        { key: "username", header: "username", className: "font-medium" },
        { key: "email", header: "Email", className: "text-abu" },
        { key: "joinedAt", header: "Tanggal Bergabung", className: "text-abu" },
        {
            key: "actions",
            header: "Aksi",
            render: (user) => (
                <IconButton label={`Hapus ${user.name}`} onClick={() => handleDelete(user)}>
                    <TrashIcon />
                </IconButton>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>User</PageTitle>
            <DataTable columns={columns} rows={users} emptyText="Belum ada user." />
        </section>
    )
}

export default Users
