// Harus sama dengan server/src/constants.js (server menolak kategori di luar daftar ini)
import makanan from "../assets/ECommerce/makanan.svg"
import minuman from "../assets/ECommerce/minuman.svg"
import fashion from "../assets/ECommerce/fashion.svg"
import creative from "../assets/ECommerce/creative.svg"
import listrik from "../assets/ECommerce/listrik.svg"
import pulsa from "../assets/ECommerce/pulsa.svg"
import jasa from "../assets/ECommerce/jasa.svg"
import obatObatan from "../assets/ECommerce/obatObatan.svg"

export const productCategories = [
    { icon: makanan, label: "Makanan" },
    { icon: minuman, label: "Minuman" },
    { icon: fashion, label: "Fashion" },
    { icon: creative, label: "Creative" },
    { icon: listrik, label: "Listrik" },
    { icon: pulsa, label: "Pulsa" },
    { icon: jasa, label: "Jasa" },
    { icon: obatObatan, label: "Obat-obatan" },
]

export const blogCategories = ["Technology", "Bisnis", "Pelajaran", "Food"]

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
