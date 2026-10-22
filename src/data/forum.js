import postImage from "../assets/forum/image.png"
import profileHighLine from "../assets/forum/profileHighLine.png"
import profileMidLine from "../assets/forum/profileMidLine.png"
import profileNoLine from "../assets/forum/profileNoLine.png"

export const forumCategories = [
    { label: "Campus Life", color: "#E7B66C" },
    { label: "Tech", color: "#7DD4B5" },
    { label: "Kesehatan", color: "#9580D9" },
    { label: "Informasi", color: "#E88989" },
    { label: "Bisnis", color: "#D881D3" },
    { label: "Random", color: "#7CC5D8" },
]

export const trendingTopics = [
    ["Info tempat nongkrong", "di Unand dong", "14 balasan"],
    ["Guyss, ada info jadwal", "wisuda ga?", "12 balasan"],
    ["Rekomen beli hadiah", "buat sempro", "10 balasan"],
    ["Tips n trik war KRS", "", "8 balasan"],
]

export const forumPosts = [
    {
        id: 1,
        author: "mrc1na",
        date: "06/07/2024",
        replyCount: 2,
        profile: profileNoLine,
        line: profileMidLine,
        people: true,
        text: "Do you like pigeons ?",
        category: "Random",
        color: "#7CC5D8",
        replies: "2 balasan",
    },
    {
        id: 2,
        author: "mrc1na",
        date: "05/07/2024",
        replyCount: 14,
        profile: profileNoLine,
        line: profileHighLine,
        people: true,
        text: "Info tempat nongkrong di Unand dong",
        category: "Campus Life",
        color: "#E7B66C",
        replies: "14 balasan",
        image: postImage,
    },
    {
        id: 3,
        author: "mrc1na",
        date: "03/07/2024",
        replyCount: 0,
        profile: profileNoLine,
        text: "Ig Error ya?",
        category: "Tech",
        color: "#7DD4B5",
    },
]
