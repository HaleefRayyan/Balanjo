import { useRef } from "react"

// Editor ringan berbasis contentEditable + document.execCommand.
// execCommand sudah deprecated tapi masih didukung semua browser; ganti ke library (mis. TipTap)
// kalau butuh fitur lebih. HTML hasilnya WAJIB disanitasi (DOMPurify) sebelum ditampilkan.

const Icon = ({ children }) => (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
)

const escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const buttons = [
    { label: "Bold", command: "bold", content: <strong>B</strong> },
    { label: "Italic", command: "italic", content: <em className="font-serif">I</em> },
    { label: "Underline", command: "underline", content: <u>U</u> },
    { label: "Strikethrough", command: "strikeThrough", content: <span className="line-through">S</span> },
    {
        label: "Inline code",
        run: () => {
            const text = window.getSelection()?.toString()
            if (text) document.execCommand("insertHTML", false, `<code>${escapeHtml(text)}</code>`)
        },
        content: <Icon><path d="M7 6l-4 4 4 4M13 6l4 4-4 4" /></Icon>,
    },
    { label: "Hapus format", command: "removeFormat", content: <span className="text-[13px]">T<sub>x</sub></span> },
    { label: "Bullet list", command: "insertUnorderedList", content: <Icon><path d="M8 5h9M8 10h9M8 15h9" /><circle cx="4" cy="5" r=".8" fill="currentColor" /><circle cx="4" cy="10" r=".8" fill="currentColor" /><circle cx="4" cy="15" r=".8" fill="currentColor" /></Icon> },
    { label: "Numbered list", command: "insertOrderedList", content: <Icon><path d="M8 5h9M8 10h9M8 15h9M3 4l1-.5V7M3 13.5c0-.8 2-.8 2 0 0 .7-2 1.5-2 2.5h2" /></Icon> },
    {
        label: "Link",
        run: () => {
            const url = window.prompt("Masukkan URL (https://...)")
            if (url && /^https?:\/\//i.test(url.trim())) document.execCommand("createLink", false, url.trim())
        },
        content: <Icon><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" /></Icon>,
    },
    { label: "Code block", command: "formatBlock", value: "<pre>", content: <Icon><rect x="2.5" y="3.5" width="15" height="13" rx="2" /><path d="M8 8l-2 2 2 2M12 8l2 2-2 2" /></Icon> },
    { label: "Quote", command: "formatBlock", value: "<blockquote>", content: <Icon><path d="M4 14c0-4 1-6 4-7M11 14c0-4 1-6 4-7" /></Icon> },
    { label: "Garis pemisah", command: "insertHorizontalRule", content: <Icon><path d="M3 10h14" /></Icon> },
]

const RichTextEditor = ({ id, onChange, placeholder = "" }) => {
    const editorRef = useRef(null)

    const exec = (command, value = null) => {
        editorRef.current.focus()
        document.execCommand(command, false, value)
        onChange(editorRef.current.innerHTML)
    }

    const runButton = (button) => {
        editorRef.current.focus()
        if (button.run) button.run()
        else document.execCommand(button.command, false, button.value ?? null)
        onChange(editorRef.current.innerHTML)
    }

    // onMouseDown + preventDefault: tombol toolbar tidak mencuri seleksi teks dari editor
    const keepSelection = (event) => event.preventDefault()

    return (
        <div>
            <div className="flex flex-wrap items-center gap-1 pb-2 text-xs text-[#333]" role="toolbar" aria-label="Toolbar editor">
                <select
                    aria-label="Gaya teks"
                    defaultValue="<p>"
                    onChange={(event) => exec("formatBlock", event.target.value)}
                    className="h-7 cursor-pointer rounded bg-transparent pr-1 outline-none hover:bg-[#f1f1f1]"
                >
                    <option value="<p>">Normal text</option>
                    <option value="<h2>">Heading 1</option>
                    <option value="<h3>">Heading 2</option>
                </select>
                <select
                    aria-label="Perataan"
                    defaultValue="justifyLeft"
                    onChange={(event) => exec(event.target.value)}
                    className="h-7 cursor-pointer rounded bg-transparent pr-1 outline-none hover:bg-[#f1f1f1]"
                >
                    <option value="justifyLeft">Rata kiri</option>
                    <option value="justifyCenter">Tengah</option>
                    <option value="justifyRight">Rata kanan</option>
                    <option value="justifyFull">Rata kiri-kanan</option>
                </select>
                {buttons.map((button) => (
                    <button
                        key={button.label}
                        type="button"
                        title={button.label}
                        aria-label={button.label}
                        onMouseDown={keepSelection}
                        onClick={() => runButton(button)}
                        className="flex h-7 min-w-7 cursor-pointer items-center justify-center rounded px-1 hover:bg-[#f1f1f1]"
                    >
                        {button.content}
                    </button>
                ))}
            </div>
            <div
                id={id}
                ref={editorRef}
                role="textbox"
                aria-multiline="true"
                contentEditable
                suppressContentEditableWarning
                data-placeholder={placeholder}
                onInput={(event) => onChange(event.currentTarget.innerHTML)}
                className="rich-text min-h-50 rounded border border-[#adadad] p-3 text-sm text-[#333] outline-none focus:border-button empty:before:text-[#bbb] empty:before:content-[attr(data-placeholder)]"
            />
        </div>
    )
}

export default RichTextEditor
