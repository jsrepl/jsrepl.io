import React from 'react'
import Error404 from '@/components/error404'
import Footer from '@/components/footer'
import Header from '@/components/header'
import ThemeProvider from '@/components/providers/theme-provider'

export default function NotFound() {
  return (
    <ThemeProvider forcedTheme="dark-plus">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Error404 />
        </main>
        <Footer className="mt-32 max-md:mt-20" />
      </div>
    </ThemeProvider>
  )
}
