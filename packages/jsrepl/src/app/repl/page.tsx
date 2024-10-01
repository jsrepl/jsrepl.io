import React from 'react'
import type { Metadata } from 'next'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { load as loadReplStoredState } from '@/lib/repl-stored-state'
import { getReplTitle } from '@/lib/repl-title'
import ReplPlaygroundDynamic from './components/repl-playground-dynamic'

type Props = {
  params: object
  searchParams: { [key: string]: string | string[] }
}

export const dynamic = 'force-dynamic'

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

export default function ReplPage() {
  return <ReplPlaygroundDynamic />
}
