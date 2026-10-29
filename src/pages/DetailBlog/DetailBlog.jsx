import DOMPurify from "dompurify"
import { useParams } from "react-router-dom"
import { useContent } from "../../context/content"
import NotFound from "../NotFound"
import SampleArticle from "./SampleArticle"

const DetailBlog = () => {
    const { slug } = useParams()
    const { blogs } = useContent()
    const blog = blogs.find((item) => item.slug === slug)

    if (!blog) return <NotFound />

    return <section className="font-roboto text-[#111]">

        <header className="bg-background px-6 pb-12 pt-25 sm:px-12 lg:pt-12 lg:px-[8.5%]">
            <div className="mx-auto max-w-327.5">
                <span className="inline-block rounded bg-[#f4eddb] px-2 py-1 text-[14px] text-button">{blog.category}</span>
                <h1 className="mt-5 text-[40px] font-bold leading-[1.15] text-[#062653]">
                    {blog.title}
                </h1>
                <div className="mt-4 flex flex-col gap-1 text-[22px] text-[#24518b]">
                    <span>{blog.publishedAt}</span>
                    <span className="text-[#062653]">by {blog.author}</span>
                </div>
            </div>
        </header>

        <main className="mx-auto max-w-327.5 px-6 pb-24 pt-9 sm:px-10 lg:px-0">
            {blog.image && <img className="mx-auto h-auto w-185.75 max-w-full" src={blog.image} alt="" />}
            {blog.body ? (
                <article
                    className="rich-text mt-12 text-[18px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.body) }}
                />
            ) : (
                <SampleArticle />
            )}
        </main>
    </section>
}

export default DetailBlog