import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { LayoutClient } from "@/components/layout-client"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Princess Jaidee Enterprises - Custom Apparel & Services",
  description:
    "Premier provider of personalized sportswear, jerseys, and custom apparel solutions for teams and organizations.",
  keywords: "custom apparel, jerseys, sportswear, personalized clothing",
  authors: [{ name: "Princess Jaidee Enterprises" }],
  openGraph: {
    title: "Princess Jaidee Enterprises",
    description: "Custom apparel and sportswear solutions",
    type: "website",
  },
  generator: 'aidriane.app',
  icons: {
    icon: [
      { url: '/princessjd.png', type: 'image/png' },
    ],
    apple: [
      { url: '/princessjd.png', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("RootLayout mounted - favicon should be /princessjd.png")
  
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
