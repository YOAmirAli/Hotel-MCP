import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeStay | Luxury Hotel Reservations",
  description: "Experience unparalleled luxury at LuxeStay — where editorial design meets legendary service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Libre+Caslon+Text:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}