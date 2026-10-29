import sanitizeHtml from "sanitize-html"

export const slugify = (text) =>
    text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

// Hanya tag yang bisa dibuat editor di Upload Artikel
const ALIGN = [/^(left|right|center|justify)$/]
export const sanitizeArticle = (html) =>
    sanitizeHtml(html, {
        allowedTags: ["p", "div", "br", "b", "strong", "i", "em", "u", "s", "strike", "code", "pre", "blockquote", "h2", "h3", "ul", "ol", "li", "a", "hr", "span"],
        allowedAttributes: { a: ["href", "rel", "target"], "*": ["style"] },
        allowedStyles: { "*": { "text-align": ALIGN } },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }) },
    })

export const htmlToText = (html) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()
