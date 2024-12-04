import React from 'react'
import SessionProvider from '@/components/providers/session-provider'
import { CurrentUserInfo } from './CurrentUserInfo'

export default {
  component: null,
}

export const Default = () => {
  return (
    <SessionProvider>
      <CurrentUserInfo />
    </SessionProvider>
  )
}
