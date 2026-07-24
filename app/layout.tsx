import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LuxeStay | Premium Hotel Booking",
  description: "Experience luxury hospitality at its finest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}