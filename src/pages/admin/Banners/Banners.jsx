import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import { EditIcon, TrashIcon } from "../../../components/admin/icons"
import Button from "../../../components/ui/Button"
import { banners as initialBanners } from "../../../data/banners"

// editing: null = modal tertutup, {} = tambah baru, banner = edit banner itu
const BannerForm = ({ banner, takenIds, onSave, onCancel }) => {
    const isNew = !banner.id
    const [id, setId] = useState(banner.id ?? "")
    const [image, setImage] = useState(banner.image ?? "")
    const [error, setError] = useState("")

    const handleFile = (event) => {
        const file = event.target.files[0]
        if (file) setImage(URL.createObjectURL(file))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!id.trim() || !image) {
            setError("Id banner dan gambar wajib diisi.")
            return
        }
        if (isNew && takenIds.includes(id.trim())) {
            setError("Id banner sudah dipakai.")
            return
        }
        onSave({ id: id.trim(), image })
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Id Banner
                <input
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                    disabled={!isNew}
                    className="h-11 rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button disabled:bg-[#d9d9d9]"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Gambar
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-4 file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:py-2 file:text-sm"
                />
            </label>
            {image && <img src={image} alt="Pratinjau banner" className="max-h-48 w-full rounded object-cover" />}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="cursor-pointer rounded-md border border-[#adadad] px-5 py-2 text-sm">Batal</button>
                <Button type="submit" className="rounded-md px-5 py-2 text-sm">Simpan</Button>
            </div>
        </form>
    )
}

const Banners = () => {
    const [banners, setBanners] = useState(initialBanners)
    const [editing, setEditing] = useState(null)

    const handleSave = (saved) => {
        setBanners((current) => {
            const exists = current.some((item) => item.id === saved.id)
            return exists
                ? current.map((item) => (item.id === saved.id ? saved : item))
                : [...current, saved]
        })
        setEditing(null)
    }

    const handleDelete = (banner) => {
        if (window.confirm(`Hapus ${banner.id}?`)) {
            setBanners((current) => current.filter((item) => item.id !== banner.id))
        }
    }

    const columns = [
        { key: "id", header: "Id Banner", className: "text-abu" },
        {
            key: "image",
            header: "Gambar",
            render: (banner) => <img src={banner.image} alt={banner.id} className="h-24 w-38 rounded object-cover" />,
        },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (banner) => (
                <div className="flex items-center gap-3">
                    <IconButton label={`Edit ${banner.id}`} onClick={() => setEditing(banner)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton label={`Hapus ${banner.id}`} onClick={() => handleDelete(banner)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <section>
            <PageTitle action={<Button className="rounded-lg px-6 py-1.5 text-[20px]" onClick={() => setEditing({})}>Tambah</Button>}>
                Kelola Banner E-Commerce
            </PageTitle>
            <DataTable columns={columns} rows={banners} emptyText="Belum ada banner." />

            {editing && (
                <Modal title={editing.id ? `Edit ${editing.id}` : "Tambah Banner"} onClose={() => setEditing(null)}>
                    <BannerForm banner={editing} takenIds={banners.map((item) => item.id)} onSave={handleSave} onCancel={() => setEditing(null)} />
                </Modal>
            )}
        </section>
    )
}

export default Banners
