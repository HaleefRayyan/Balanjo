import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api, toQuery } from "./client"

// params: { q, category, page, pageSize, ids, excludeId, sort, minPrice, maxPrice } -> { products, total, page, pageSize }
export const useProducts = (params = {}, options = {}) =>
    useQuery({
        queryKey: ["products", params],
        queryFn: () => api(`/products${toQuery(params)}`),
        placeholderData: keepPreviousData, // daftar lama tetap tampil saat ganti halaman / cari
        ...options,
    })

export const useProduct = (id) =>
    useQuery({
        queryKey: ["product", String(id)],
        queryFn: () => api(`/products/${id}`).then((data) => data.product),
    })
