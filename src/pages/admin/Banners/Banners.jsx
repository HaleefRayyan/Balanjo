import { useState } from "react"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import Modal from "../../../components/admin/Modal"
import PageTitle from "../../../components/admin/PageTitle"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { EditIcon, TrashIcon } from "../../../components/ui/icons"
import Button from "../../../components/ui/Button"
import { useBanners, useDeleteBanner, useSaveBanner } from "../../../api/banners"

// banner: {} = tambah baru (isi label + gambar), banner yang ada = ganti gambarnya
const BannerForm = ({ banner, onDone, onCancel }) => {
    const isNew = !banner.id
    const saveBanner = useSaveBanner()
    const [label, setLabel] = useState(banner.label ?? "")
    const [image, setImage] = useState(null) // { file, preview }
    const [error, setError] = useState("")
    const preview = image?.preview ?? banner.image

    const handleFile = (event) => {
        const file = event.target.files[0]
        if (file) setImage({ file, preview: URL.createObjectURL(file) })
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!label.trim() || !image) {
            setError(isNew ? "Id banner dan gambar wajib diisi." : "Pilih gambar baru.")
            return
        }
        const formData = new FormData()
        if (isNew) formData.set("label", label.trim())
        formData.set("image", image.file)
        saveBanner.mutate({ id: banner.id, formData }, {
            onSuccess: onDone,
            onError: (requestError) => setError(requestError.message),
        })
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Id Banner
                <input
                    value={label}
                    maxLength={60}
                    onChange={(event) => setLabel(event.target.value)}
                    disabled={!isNew}
                    className="h-11 rounded border border-[#adadad] px-3 text-sm text-[#333] outline-none focus:border-button disabled:bg-[#d9d9d9]"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[#a6a6a6]">
                Gambar
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFile}
                    className="w-full rounded border border-[#adadad] text-sm text-[#404040] file:mr-4 file:border-0 file:border-r file:border-[#adadad] file:bg-[#d9d9d9] file:px-3 file:py-2 file:text-sm"
                />
            </label>
            {preview && <img src={preview} alt="Pratinjau banner" className="max-h-48 w-full rounded object-cover" />}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="cursor-pointer rounded-md border border-[#adadad] px-5 py-2 text-sm">Batal</button>
                <Button type="submit" disabled={saveBanner.isPending} className="rounded-md px-5 py-2 text-sm disabled:cursor-wait disabled:opacity-60">
                    {saveBanner.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
            </div>
        </form>
    )
}

const Banners = () => {
    const { data: banners, isPending, isError, error, refetch } = useBanners()
    const deleteBanner = useDeleteBanner()
    const [editing, setEditing] = useState(null) // null = modal tertutup

    const handleDelete = (banner) => {
        if (window.confirm(`Hapus ${banner.label}?`)) {
            deleteBanner.mutate(banner.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "label", header: "Id Banner", className: "text-abu" },
        {
            key: "image",
            header: "Gambar",
            render: (banner) => <img src={banner.image} alt={banner.label} className="h-24 w-38 rounded object-cover" />,
        },
        {
            key: "actions",
            header: "Aksi",
            className: "whitespace-nowrap",
            render: (banner) => (
                <div className="flex items-center gap-3">
                    <IconButton label={`Edit ${banner.label}`} onClick={() => setEditing(banner)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton label={`Hapus ${banner.label}`} disabled={deleteBanner.isPending} onClick={() => handleDelete(banner)}>
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
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <DataTable columns={columns} rows={banners} emptyText="Belum ada banner." />
            )}

            {editing && (
                <Modal title={editing.id ? `Edit ${editing.label}` : "Tambah Banner"} onClose={() => setEditing(null)}>
                    <BannerForm banner={editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
                </Modal>
            )}
        </section>
    )
}

export default Banners
