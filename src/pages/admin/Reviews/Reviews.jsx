import { useState } from "react"
import { Link } from "react-router-dom"
import DataTable from "../../../components/admin/DataTable"
import IconButton from "../../../components/admin/IconButton"
import PageTitle from "../../../components/admin/PageTitle"
import Pagination from "../../../components/ui/Pagination"
import { StarRating } from "../../../components/ui/Stars"
import { ErrorMessage, Loading } from "../../../components/ui/Status"
import { TrashIcon } from "../../../components/ui/icons"
import { useAdminReviews } from "../../../api/admin"
import { useDeleteReview } from "../../../api/reviews"
import { formatShortDate } from "../../../utils/format"

const filters = [undefined, 1, 2, 3, 4, 5]

// Moderasi ulasan produk: semua ulasan terbaru, bisa difilter per rating, hapus yang tidak pantas
const Reviews = () => {
    const [rating, setRating] = useState(undefined)
    const [page, setPage] = useState(1)
    const { data, isPending, isError, error, refetch } = useAdminReviews({ rating, page })
    const deleteReview = useDeleteReview()

    const handleDelete = (review) => {
        if (window.confirm(`Hapus ulasan dari ${review.author} untuk ${review.product.name}?`)) {
            deleteReview.mutate(review.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    const columns = [
        { key: "createdAt", header: "Tanggal", className: "text-abu", render: (review) => formatShortDate(new Date(review.createdAt)) },
        {
            key: "product",
            header: "Produk",
            className: "max-w-48",
            render: (review) => (
                <>
                    <Link to={`/e-commerce/product/${review.product.id}`} target="_blank" className="font-medium hover:text-button">{review.product.name}</Link>
                    <span className="block text-xs text-abu">Seller: {review.product.seller ?? "–"}</span>
                </>
            ),
        },
        { key: "author", header: "Penulis", render: (review) => <>{review.author}<span className="block text-xs text-abu">{review.authorEmail}</span></> },
        { key: "rating", header: "Rating", render: (review) => <StarRating value={review.rating} className="h-3.5 w-3.5" /> },
        { key: "comment", header: "Ulasan", className: "max-w-80 text-sm", render: (review) => review.comment || <span className="text-abu">(tanpa komentar)</span> },
        {
            key: "actions",
            header: "Aksi",
            render: (review) => (
                <IconButton label={`Hapus ulasan ${review.author}`} onClick={() => handleDelete(review)}>
                    <TrashIcon className="h-6 w-6" />
                </IconButton>
            ),
        },
    ]

    return (
        <section>
            <PageTitle>Ulasan Produk</PageTitle>
            <div className="mb-4 flex flex-wrap gap-2" role="tablist">
                {filters.map((value) => (
                    <button
                        key={value ?? "all"}
                        type="button"
                        role="tab"
                        aria-selected={rating === value}
                        onClick={() => { setRating(value); setPage(1) }}
                        className={`cursor-pointer rounded-full px-4 py-1.5 text-sm ${rating === value ? "bg-button text-white" : "bg-white text-[#555] hover:text-button"}`}
                    >
                        {value ? `${value} ★` : "Semua"}
                    </button>
                ))}
            </div>
            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : (
                <>
                    <DataTable columns={columns} rows={data.reviews} emptyText="Belum ada ulasan." />
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
                </>
            )}
        </section>
    )
}

export default Reviews
