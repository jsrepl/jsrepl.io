'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Loader from '@/components/loader'
import HeaderBase from './header-base'

export default dynamic(() => import('./repl-playground'), {
  loading: () => (
    <>
      <HeaderBase />
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader width={100} height={100} className="opacity-10" />
      </div>
    </>
  ),
  ssr: false,
})
