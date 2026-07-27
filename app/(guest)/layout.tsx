import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import ChatWidget from "@/components/chat/ChatWidget"

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}