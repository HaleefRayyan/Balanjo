import { useProductReviews, useDeleteReview } from "../../api/reviews"
import { StarRating } from "../../components/ui/Stars"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { useAuth } from "../../context/auth"
import { formatLongDate } from "../../utils/format"

// Ulasan dari pembeli (hanya pembeli dengan pesanan Selesai yang bisa memberi ulasan)
const ProductReviews = ({ product }) => {
    const { user } = useAuth()
    const { data: reviews, isPending, isError, error, refetch } = useProductReviews(product.id)
    const deleteReview = useDeleteReview()

    const handleDelete = (review) => {
        if (window.confirm("Hapus ulasan ini?")) {
            deleteReview.mutate(review.id, { onError: (requestError) => window.alert(requestError.message) })
        }
    }

    return (
        <section className="mt-10 sm:mt-12" aria-labelledby="reviews-title">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-button">
                <span className="h-0.75 w-16 bg-button" />
                <h2 id="reviews-title" className="text-xl font-semibold sm:text-2xl">Ulasan pembeli</h2>
                {product.rating.count > 0 && (
                    <span className="flex items-center gap-2 text-sm text-[#555]">
                        <StarRating value={product.rating.average} />
                        {product.rating.average} · {product.rating.count} ulasan
                    </span>
                )}
            </div>

            {isPending ? <Loading /> : isError ? <ErrorMessage error={error} onRetry={refetch} /> : reviews.length === 0 ? (
                <p className="rounded-lg bg-white p-6 text-sm text-abu shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    Belum ada ulasan. Pembeli bisa memberi ulasan dari Riwayat Pesanan setelah pesanan selesai.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {reviews.map((review) => (
                        <li key={review.id} className="rounded-lg bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:p-5">
                            <div className="flex items-center gap-3">
                                {review.authorAvatar
                                    ? <img src={review.authorAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                                    : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-button/10 text-sm font-semibold text-button">{review.author.charAt(0).toUpperCase()}</span>}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[#333]">{review.author}</p>
                                    <p className="text-xs text-abu">
                                        {formatLongDate(new Date(review.createdAt))}{review.variant && ` · ${review.variant}`}
                                    </p>
                                </div>
                                <StarRating value={review.rating} className="h-3.5 w-3.5" />
                            </div>
                            {review.comment && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#555]">{review.comment}</p>}
                            {user && (user.id === review.authorId || user.role === "admin") && (
                                <button type="button" disabled={deleteReview.isPending} onClick={() => handleDelete(review)} className="mt-2 cursor-pointer text-xs text-red-600 hover:underline disabled:opacity-50">
                                    Hapus ulasan
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default ProductReviews
