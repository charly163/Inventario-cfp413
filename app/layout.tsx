import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Inventario CFP 413",
  description: "Sistema de gestión de inventario para el pañol del Centro de Formación Profesional 413",
  keywords: ["inventario", "pañol", "cfp413", "herramientas", "préstamos"],
  authors: [{ name: "CFP 413" }],
  creator: "CFP 413",
  publisher: "CFP 413",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://inventario-cfp413.vercel.app",
    title: "Sistema de Inventario CFP 413",
    description: "Sistema de gestión de inventario para el pañol del Centro de Formación Profesional 413",
    siteName: "Inventario CFP 413",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Inventario CFP 413",
    description: "Sistema de gestión de inventario para el pañol del Centro de Formación Profesional 413",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
