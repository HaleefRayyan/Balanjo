import postImage from "../assets/forum/image.png"

export const forumCategories = [
    { label: "Campus Life", color: "#E7B66C" },
    { label: "Tech", color: "#7DD4B5" },
    { label: "Kesehatan", color: "#9580D9" },
    { label: "Informasi", color: "#E88989" },
    { label: "Bisnis", color: "#D881D3" },
    { label: "Random", color: "#7CC5D8" },
]

export const categoryColor = (label) =>
    forumCategories.find((category) => category.label === label)?.color ?? "#CDCDCD"

const replyPool = [
    ["budigeming", "Setuju banget, aku juga pernah ngalamin."],
    ["maemunah", "Coba tanya ke grup angkatan, biasanya ada info."],
    ["wawanzz", "Mantap, makasih infonya!"],
    ["munaroh", "Aku rekomen tempat dekat gerbang belakang, murah dan nyaman."],
    ["anto", "Ikut nyimak ya."],
]

// Balasan contoh; isi teks diambil bergiliran dari replyPool
const makeComments = (count, date) =>
    Array.from({ length: count }, (_, index) => {
        const [author, text] = replyPool[index % replyPool.length]
        return { id: index + 1, author, text, date }
    })

export const forumPosts = [
    { id: 1, author: "mrc1na", text: "Do you like pigeons ?", category: "Random", date: "06/07/2024", comments: makeComments(2, "06/07/2024") },
    { id: 2, author: "mrc1na", text: "Info tempat nongkrong di Unand dong", category: "Campus Life", date: "05/07/2024", image: postImage, comments: makeComments(14, "05/07/2024") },
    { id: 3, author: "mrc1na", text: "Ig Error ya?", category: "Tech", date: "03/07/2024", comments: [] },
    { id: 4, author: "wawanzz", text: "Guyss, ada info jadwal wisuda ga?", category: "Informasi", date: "02/07/2024", comments: makeComments(12, "02/07/2024") },
    { id: 5, author: "maemunah", text: "Rekomen beli hadiah buat sempro", category: "Campus Life", date: "01/07/2024", comments: makeComments(10, "01/07/2024") },
    { id: 6, author: "budigeming", text: "Tips n trik war KRS", category: "Campus Life", date: "30/06/2024", comments: makeComments(8, "30/06/2024") },
]
