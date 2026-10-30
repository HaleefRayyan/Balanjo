// Email lewat SMTP (Gmail app password, Brevo, Resend SMTP, dll.).
// Tanpa SMTP_HOST: email tidak dikirim, isinya dicetak di log server (development / sebelum disetel).
import nodemailer from "nodemailer"
import { config } from "../config.js"

const { smtp } = config
const transport = smtp.host
    ? nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
    })
    : null

export const emailEnabled = Boolean(transport)

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])

// Template sederhana bergaya Balanjo. Semua teks di-escape (nama produk dsb. berasal dari user).
const render = ({ title, lines, link, linkLabel }) => {
    const url = link ? `${config.clientUrl}${link}` : null
    const html = `<!doctype html><html><body style="margin:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#333">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:8px">
<tr><td style="padding:20px 28px;border-bottom:3px solid #A08336;font-size:22px;font-weight:bold;color:#A08336">Balanjo</td></tr>
<tr><td style="padding:24px 28px">
<h1 style="margin:0 0 16px;font-size:20px;color:#2d2d2d">${escapeHtml(title)}</h1>
${lines.map((line) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${escapeHtml(line)}</p>`).join("")}
${url ? `<p style="margin:24px 0 8px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#A08336;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:15px">${escapeHtml(linkLabel ?? "Buka Balanjo")}</a></p>` : ""}
</td></tr>
<tr><td style="padding:16px 28px;font-size:12px;color:#999;border-top:1px solid #eee">Email otomatis dari Balanjo. Atur notifikasi email di Profil Saya &gt; Akun.</td></tr>
</table></td></tr></table></body></html>`
    const text = [title, "", ...lines, ...(url ? ["", `${linkLabel ?? "Buka Balanjo"}: ${url}`] : [])].join("\n")
    return { html, text }
}

// { to, subject, title, lines: [teks], link: "/path", linkLabel }
export const sendEmail = async ({ to, subject, ...content }) => {
    const { html, text } = render({ title: subject, ...content })
    if (!transport) {
        console.log(`[email] ke ${to}: ${subject}\n${text}\n`)
        return
    }
    await transport.sendMail({ from: smtp.from, to, subject: `${subject} · Balanjo`, html, text })
}
