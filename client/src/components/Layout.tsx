import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { BackgroundImage } from "./BackgroundImage"

export function Layout() {
  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundImage />

      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}