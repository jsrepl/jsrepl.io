import React from 'react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ReadonlyURLSearchParams } from 'next/navigation'
import Loader from '@/components/loader'
import { load as loadReplStoredState } from '@/lib/repl-stored-state'
import { getReplTitle } from '@/lib/repl-title'
import HeaderBase from './components/header-base'

type Props = {
  params: object
  searchParams: { [key: string]: string | string[] }
}

export function generateMetadata({ searchParams }: Props): Metadata {
  try {
    // Convert searchParams to URLSearchParams
    const urlSearchParams = new ReadonlyURLSearchParams(
      Object.entries(searchParams).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
      )
    )

    const state = loadReplStoredState(urlSearchParams)
    const title = getReplTitle(state)
    return { title }
  } catch (e) {
    console.error('generateMetadata error', e)
    return { title: 'JSREPL' }
  }
}

const ReplPlaygroundDynamic = dynamic(() => import('./components/repl-playground'), {
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

export default function ReplPage() {
  return (
    <>
      <ReplPlaygroundDynamic />
    </>
  )
}
