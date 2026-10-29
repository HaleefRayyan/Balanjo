import { useState } from "react"
import { AuthContext } from "./auth"
import { readJSON, writeJSON } from "../utils/storage"

const STORAGE_KEY = "balanjo:user"

const nameFromEmail = (email) => {
    const name = email.split("@")[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
}

// Auth palsu sampai backend tersedia: semua login diterima,
// email yang diawali "admin" dapat role admin.
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => readJSON(STORAGE_KEY, null))

    const login = ({ email, name }) => {
        const nextUser = {
            name: name || nameFromEmail(email),
            email,
            role: email.toLowerCase().startsWith("admin") ? "admin" : "user",
        }
        setUser(nextUser)
        writeJSON(STORAGE_KEY, nextUser)
        return nextUser
    }

    const logout = () => {
        setUser(null)
        writeJSON(STORAGE_KEY, null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
