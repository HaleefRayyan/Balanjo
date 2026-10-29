import kacamata from "../assets/ECommerce/kacamata.png"
import lilin from "../assets/ECommerce/lilin.png"
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

const templates = [
    {
        photo: kacamata,
        category: "Fashion",
        name: "Kacamata Korea Hitam",
        price: 59000,
        variants: ["Hitam", "Coklat", "Transparan"],
        description: "Kacamata ini dapat melindungi mata kita dari berbagai jenis radiasi. Mulai dari radiasi sinar ultraviolet sampai radiasi nuklir. Selain itu, kacamata ini juga memiliki bentuk yang keren dan kece.",
    },
    {
        photo: lilin,
        category: "Creative",
        name: "Lilin Aromaterapi Varian Anggur",
        price: 45000,
        variants: ["Anggur", "Lavender", "Vanila"],
        description: "Lilin aromaterapi dengan wangi yang menenangkan, cocok untuk menemani belajar dan beristirahat.",
    },
]

const products = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    ...templates[index % templates.length],
}))

export const findProduct = (id) => products.find((product) => product.id === Number(id))

export const searchProducts = (list, query) => {
    const q = query.trim().toLowerCase()
    return q ? list.filter((product) => product.name.toLowerCase().includes(q)) : list
}

export default products
