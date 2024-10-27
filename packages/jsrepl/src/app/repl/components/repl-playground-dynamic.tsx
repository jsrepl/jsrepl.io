'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import FullscreenLoader from '@/components/fullscreen-loader'

export default dynamic(() => import('./repl-playground'), {
  loading: () => <FullscreenLoader />,
  ssr: false,
})
