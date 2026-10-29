import DOMPurify from "dompurify"
import { useParams } from "react-router-dom"
import { useBlog } from "../../api/blogs"
import { ErrorMessage, Loading } from "../../components/ui/Status"
import { formatDateTime } from "../../utils/format"
import NotFound from "../NotFound"

const DetailBlog = () => {
    const { slug } = useParams()
    const { data: blog, isPending, isError, error, refetch } = useBlog(slug)

    if (isPending) return <div className="mx-auto max-w-327.5 px-6 pt-16"><Loading /></div>
    if (isError && error.status === 404) return <NotFound />
    if (isError) return <div className="mx-auto max-w-327.5 px-6 pt-16"><ErrorMessage error={error} onRetry={refetch} /></div>

    return <section className="font-roboto text-[#111]">

        <header className="bg-background px-6 pb-12 pt-25 sm:px-12 lg:pt-12 lg:px-[8.5%]">
            <div className="mx-auto max-w-327.5">
                <span className="inline-block rounded bg-[#f4eddb] px-2 py-1 text-[14px] text-button">{blog.category}</span>
                <h1 className="mt-5 text-[40px] font-bold leading-[1.15] text-[#062653]">
                    {blog.title}
                </h1>
                <div className="mt-4 flex flex-col gap-1 text-[22px] text-[#24518b]">
                    <span>{formatDateTime(new Date(blog.createdAt))}</span>
                    <span className="text-[#062653]">by {blog.author}</span>
                </div>
            </div>
        </header>

        <main className="mx-auto max-w-327.5 px-6 pb-24 pt-9 sm:px-10 lg:px-0">
            {blog.cover && <img className="mx-auto h-auto w-185.75 max-w-full" src={blog.cover} alt="" />}
            {/* sudah disanitasi server; DOMPurify sebagai lapisan pengaman kedua */}
            <article
                className="rich-text mt-12 text-justify text-[20px] font-light leading-snug tracking-[0.04em]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.body) }}
            />
        </main>
    </section>
}

export default DetailBlog
