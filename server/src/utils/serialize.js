// Bentuk data yang dikirim ke frontend (jangan pernah kirim passwordHash)

export const serializeUser = (user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role === "ADMIN" ? "admin" : "user",
    joinedAt: user.createdAt,
})

export const serializeBlog = (blog, { withBody = false } = {}) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    category: blog.category,
    cover: blog.coverUrl,
    author: blog.author?.name,
    authorId: blog.authorId,
    createdAt: blog.createdAt,
    ...(withBody && { body: blog.body }),
})

export const serializeComment = (comment) => ({
    id: comment.id,
    text: comment.text,
    author: comment.author?.name,
    authorId: comment.authorId,
    createdAt: comment.createdAt,
})

export const serializeForumPost = (post) => ({
    id: post.id,
    text: post.text,
    category: post.category,
    image: post.imageUrl,
    author: post.author?.name,
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
    seller: product.seller?.name ?? null,
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

export const serializeOrder = (order) => ({
    id: order.id,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items?.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        variant: item.variant,
        quantity: item.quantity,
    })),
})
