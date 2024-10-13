'use client'

import React from 'react'
import { useEarlyAccessToast } from '@/hooks/useEarlyAccessToast'
import { useNewVersionToast } from '@/hooks/useNewVersionToast'
import CodeEditor from './code-editor'
import { ErrorsNotification } from './errors-notification'
import GridLayout from './grid-layout'
import Header from './header'
import Preview from './preview'

export default function ReplPlaygroundMain() {
  console.log('ReplPlaygroundMain render')

  useEarlyAccessToast()
  useNewVersionToast()

  return (
    <>
      <Header />

      <main className="bg-background relative min-h-0 flex-1">
        <GridLayout>
          <CodeEditor className="min-w-0" />
          <Preview />
        </GridLayout>

        <ErrorsNotification />
      </main>
    </>
  )
}
