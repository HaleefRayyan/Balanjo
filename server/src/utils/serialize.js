// Bentuk data yang dikirim ke frontend (jangan pernah kirim passwordHash)

export const serializeUser = (user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "user",
    avatar: user.avatarUrl ?? null,
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

export const serializeProduct = (product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    photo: product.photoUrl,
    variants: JSON.parse(product.variants),
    stock: product.stock,
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
})

export const serializeOrder = (order) => ({
    id: order.id,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items?.map(serializeOrderItem),
})
