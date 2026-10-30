// Bentuk data yang dikirim ke frontend (jangan pernah kirim passwordHash)

export const serializeUser = (user) => ({
    id: user.id,
    name: user.name,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    username: user.username,
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "user",
    avatar: user.avatarUrl ?? null,
    emailNotifications: user.emailNotifications ?? true,
    joinedAt: user.createdAt,
})

export const serializeBlog = (blog, { withBody = false } = {}) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    category: blog.category,
    cover: blog.coverUrl,
    author: blog.author?.name,
    authorAvatar: blog.author?.avatarUrl ?? null,
    authorId: blog.authorId,
    createdAt: blog.createdAt,
    ...(withBody && { body: blog.body }),
})

export const serializeComment = (comment) => ({
    id: comment.id,
    text: comment.text,
    author: comment.author?.name,
    authorAvatar: comment.author?.avatarUrl ?? null,
    authorId: comment.authorId,
    createdAt: comment.createdAt,
})

export const serializeForumPost = (post) => ({
    id: post.id,
    text: post.text,
    category: post.category,
    image: post.imageUrl,
    author: post.author?.name,
    authorAvatar: post.author?.avatarUrl ?? null,
    authorId: post.authorId,
    createdAt: post.createdAt,
    commentCount: post._count?.comments ?? post.comments?.length ?? 0,
    ...(post.comments && { comments: post.comments.map(serializeComment) }),
})

// Relasi yang dibutuhkan serializeProduct (seller, variasi + stoknya, foto)
export const productInclude = {
    seller: { select: { name: true } },
    variants: { orderBy: { position: "asc" } },
    photos: { orderBy: { position: "asc" } },
}

// rating: { average, count } dari ulasan (diisi route produk)
export const serializeProduct = (product, rating = { average: null, count: 0 }) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    photo: product.photoUrl,
    variants: (product.variants ?? []).map((variant) => variant.name),
    variantStock: Object.fromEntries((product.variants ?? []).map((variant) => [variant.name, variant.stock])),
    photos: product.photos?.length ? product.photos.map((photo) => photo.url) : [product.photoUrl],
    stock: product.stock,
    rating,
    seller: product.seller?.name ?? null,
    sellerId: product.sellerId,
})

export const serializeBanner = (banner) => ({
    id: banner.id,
    label: banner.label,
    image: banner.imageUrl,
})

export const serializeBannerRequest = (request) => ({
    id: request.id,
    product: request.product && { id: request.product.id, name: request.product.name },
    seller: request.seller?.name,
    image: request.imageUrl,
    status: request.status,
    createdAt: request.createdAt,
})

export const serializeOrderItem = (item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    variant: item.variant,
    quantity: item.quantity,
    status: item.status,
    photo: item.product?.photoUrl ?? null, // null kalau produknya sudah dihapus
    seller: item.seller?.name ?? null,
    review: item.review ? { id: item.review.id, rating: item.review.rating } : null,
    platformFee: item.platformFee,
})

export const serializeDelivery = (order) => ({
    method: order.deliveryMethod,
    recipientName: order.recipientName,
    phone: order.phone,
    address: order.address,
    note: order.note,
})

export const serializePayoutAccount = (user) => (user.payoutMethod
    ? { method: user.payoutMethod, accountNumber: user.payoutAccountNumber, accountName: user.payoutAccountName }
    : null)

export const serializePayout = (payout) => ({
    id: payout.id,
    amount: payout.amount,
    status: payout.status,
    method: payout.method,
    accountNumber: payout.accountNumber,
    accountName: payout.accountName,
    adminNote: payout.adminNote,
    seller: payout.seller ? { id: payout.seller.id, name: payout.seller.name, email: payout.seller.email } : undefined,
    processedAt: payout.processedAt,
    createdAt: payout.createdAt,
})

export const serializeRefund = (refund) => ({
    id: refund.id,
    orderId: refund.orderId,
    orderItemId: refund.orderItemId,
    amount: refund.amount,
    reason: refund.reason,
    description: refund.description,
    status: refund.status,
    adminNote: refund.adminNote,
    processedAt: refund.processedAt,
    createdAt: refund.createdAt,
})

// online: dibayar / dibuat lewat Midtrans (false untuk pesanan lama & mode development)
export const serializePayment = (order) => ({
    status: order.paymentStatus,
    type: order.paymentType,
    online: Boolean(order.paymentRef),
    expiresAt: order.paymentExpiresAt,
    paidAt: order.paidAt,
})

export const serializeReview = (review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    author: review.user?.name,
    authorAvatar: review.user?.avatarUrl ?? null,
    authorId: review.userId,
    variant: review.orderItem?.variant ?? null,
    createdAt: review.createdAt,
})

export const serializeOrder = (order) => ({
    id: order.id,
    total: order.total,
    subtotal: order.total - order.shippingFee,
    shippingFee: order.shippingFee,
    delivery: serializeDelivery(order),
    payment: serializePayment(order),
    refunds: order.refunds?.map(serializeRefund) ?? [],
    createdAt: order.createdAt,
    items: order.items?.map(serializeOrderItem),
})
