import { usePathname, useSearchParams } from 'next/navigation'

export type ReplParams = {
  id: string | undefined
  searchParams: URLSearchParams
}

export function useReplParams(): ReplParams {
  // HACK: useParams is not used here, because I use "shallow" routing when
  // a repl is forked or saved - I use history pushState/replaceState directly
  // to update the url to achieve rerender without remounting the entire page,
  // which is undesirable because remounting monaco editor is slow and causes editor's
  // state to be lost (cursor position, popovers/suggestions, and many other things).
  // So, I need to extract the id from the pathname, because useParams is not updated
  // reactively (unlike useSearchParams and usePathname) when the url is updated with
  // pushState/replaceState.
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const id = extractReplId(pathname)
  return { id, searchParams }
}

export function replQueryKey(replParams: ReplParams): ['repl', ReplParams] {
  return ['repl', replParams]
}

function extractReplId(pathname: string): string | undefined {
  const match = pathname.match(/\/repl\/([^\/]+)/)
  return match ? match[1] : undefined
}
