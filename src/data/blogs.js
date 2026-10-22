import cover from "../assets/blog/blog.png"
import image from "../assets/blog/image.png"
import profile from "../assets/blog/profile.png"

const blogs = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    slug: `impact-of-technology-on-the-workplace-${index + 1}`,
    title: "The Impact of Technology on the Workplace: How Technology is Changing",
    category: "Technology",
    cover,
    image,
    author: "Elizabeth Slavin",
    authorPhoto: profile,
    date: "August 20, 2022",
    publishedAt: "20 Jan 2024, 8:00pm",
}))

export const blogCategories = [
    { value: "teknologi", label: "Teknologi" },
    { value: "bisnis", label: "Bisnis" },
    { value: "gaya-hidup", label: "Gaya Hidup" },
]

export const findBlog = (slug) => blogs.find((blog) => blog.slug === slug)

export default blogs
