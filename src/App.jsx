import { RouterProvider } from "react-router-dom"
import { useEffect } from "react"
import router from "./routes"
import AuthProvider from "./context/AuthProvider"

function App() {
  useEffect(() => {
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state === "idle") {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" })
      }
    })

    return unsubscribe
  }, [])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
