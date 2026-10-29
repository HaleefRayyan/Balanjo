import { createContext, useContext } from "react"

export const ContentContext = createContext(null)

export const useContent = () => {
    const context = useContext(ContentContext)
    if (!context) throw new Error("useContent harus dipakai di dalam <ContentProvider>")
    return context
}
