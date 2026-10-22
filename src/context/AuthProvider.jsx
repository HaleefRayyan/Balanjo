import { useState } from "react"
import { AuthContext } from "./auth"

const STORAGE_KEY = "balanjo:user"

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch {
        return null
    }
}

const saveUser = (user) => {
    try {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        // storage bisa diblokir (mode private), login tetap jalan selama tab terbuka
    }
}

const nameFromEmail = (email) => {
    const name = email.split("@")[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
}

// Auth palsu sampai backend tersedia: semua login diterima,
// email yang diawali "admin" dapat role admin.
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readUser)

    const login = ({ email, name }) => {
        const nextUser = {
            name: name || nameFromEmail(email),
            email,
            role: email.toLowerCase().startsWith("admin") ? "admin" : "user",
        }
        setUser(nextUser)
        saveUser(nextUser)
        return nextUser
    }

    const logout = () => {
        setUser(null)
        saveUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
