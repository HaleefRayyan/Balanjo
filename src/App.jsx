import { RouterProvider } from "react-router-dom"
import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import router from "./routes"
import AuthProvider from "./context/AuthProvider"
import CartProvider from "./context/CartProvider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // jangan ulangi permintaan yang ditolak (404/403); error jaringan dicoba sekali lagi
      retry: (failureCount, error) => (error?.status === 0 || error?.status >= 500) && failureCount < 1,
    },
  },
})

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
