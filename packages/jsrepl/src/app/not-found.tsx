import React from 'react'
import Error404 from '@/components/error404'
import Footer from '@/components/footer'
import Header from '@/components/header'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Error404 />
      </main>
      <Footer className="mt-32 max-md:mt-20" />
    </div>
  )
}
