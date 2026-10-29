import { RouterProvider } from "react-router-dom"
import { useEffect } from "react"
import router from "./routes"
import AuthProvider from "./context/AuthProvider"
import CartProvider from "./context/CartProvider"
import ContentProvider from "./context/ContentProvider"

function App() {
  useEffect(() => {
    // scroll ke atas hanya saat pindah halaman, bukan saat query (?q=, ?page=) berubah
    let lastPath = router.state.location.pathname
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state === "idle" && state.location.pathname !== lastPath) {
        lastPath = state.location.pathname
        window.scrollTo({ top: 0, left: 0, behavior: "auto" })
      }
    })

    return unsubscribe
  }, [])

  return (
    <AuthProvider>
      <ContentProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ContentProvider>
    </AuthProvider>
  )
}

export default App
