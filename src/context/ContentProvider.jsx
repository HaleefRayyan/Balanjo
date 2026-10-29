import { useState } from "react"
import { ContentContext } from "./content"
import initialBlogs, { defaultAuthorPhoto, defaultBlogCover } from "../data/blogs"
import { forumPosts as initialPosts } from "../data/forum"
import { banners as initialBanners } from "../data/banners"
import { formatDateTime, formatLongDate, formatShortDate, slugify } from "../utils/format"

const nextId = (list) => Math.max(0, ...list.map((item) => item.id)) + 1

// Konten situs (blog, forum, banner) disimpan di memori sampai ada backend:
// perubahan langsung terlihat di semua halaman, tapi hilang saat reload.
const ContentProvider = ({ children }) => {
    const [blogs, setBlogs] = useState(initialBlogs)
    const [forumPosts, setForumPosts] = useState(initialPosts)
    const [banners, setBanners] = useState(initialBanners)

    const addBlog = ({ title, category, body, image, author }) => {
        const base = slugify(title) || "artikel"
        let slug = base
        for (let n = 2; blogs.some((blog) => blog.slug === slug); n++) slug = `${base}-${n}`

        const now = new Date()
        const blog = {
            id: nextId(blogs),
            slug,
            title,
            category,
            body,
            cover: image || defaultBlogCover,
            image,
            author,
            authorPhoto: defaultAuthorPhoto,
            date: formatLongDate(now),
            publishedAt: formatDateTime(now),
        }
        setBlogs((current) => [blog, ...current])
        return blog
    }

    const removeBlog = (id) => setBlogs((current) => current.filter((blog) => blog.id !== id))

    const addForumPost = ({ text, category, image, author }) => {
        const post = { id: nextId(forumPosts), author, text, category, image, date: formatShortDate(), comments: [] }
        setForumPosts((current) => [post, ...current])
        return post
    }

    const removeForumPost = (id) => setForumPosts((current) => current.filter((post) => post.id !== id))

    const addComment = (postId, { author, text }) => {
        setForumPosts((current) => current.map((post) => post.id === postId
            ? { ...post, comments: [...post.comments, { id: nextId(post.comments), author, text, date: formatShortDate() }] }
            : post))
    }

    const saveBanner = (banner) => {
        setBanners((current) => current.some((item) => item.id === banner.id)
            ? current.map((item) => (item.id === banner.id ? banner : item))
            : [...current, banner])
    }

    const removeBanner = (id) => setBanners((current) => current.filter((banner) => banner.id !== id))

    return (
        <ContentContext.Provider value={{
            blogs, addBlog, removeBlog,
            forumPosts, addForumPost, removeForumPost, addComment,
            banners, saveBanner, removeBanner,
        }}>
            {children}
        </ContentContext.Provider>
    )
}

export default ContentProvider
