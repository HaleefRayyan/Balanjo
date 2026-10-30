import { useQuery } from "@tanstack/react-query"
import { api } from "./client"

// Profil toko publik: { id, name, avatar, joinedAt, productCount, sold, rating }
export const useSellerStore = (id) =>
    useQuery({
        queryKey: ["store", String(id)],
        queryFn: () => api(`/sellers/${id}`).then((data) => data.seller),
    })
