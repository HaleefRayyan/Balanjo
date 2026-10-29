import ProductList, { ProductSearch } from "../../components/sections/ProductList"
import useProductQuery from "../../components/sections/ProductList/useProductQuery"
import products from "../../data/products"
import head from "../../assets/header/header.png"
import { useParams } from "react-router-dom"

const DetailCategory = () => {
    const { category } = useParams()
    const [query, setQuery] = useProductQuery()
    const inCategory = products.filter((product) => product.category.toLowerCase() === category.toLowerCase())

    return (
        <main className="mx-auto w-full max-w-[1720px] px-5 pb-20 pt-29 lg:pt-16 sm:px-8 lg:px-[6.5vw]">
            <ProductSearch value={query} onChange={setQuery} />

            <section
                className="mt-5 flex h-40 items-center justify-center rounded-lg bg-cover bg-center bg-no-repeat sm:h-44"
                style={{ backgroundImage: `url(${head})` }}
                aria-label={`${category} category`}
            >
                <h1 className="text-center text-4xl font-bold leading-none text-white sm:text-5xl">
                    {category}
                </h1>
            </section>

            <div className="mt-12">
                <ProductList products={inCategory} query={query} />
            </div>
        </main>
    )
}

export default DetailCategory
