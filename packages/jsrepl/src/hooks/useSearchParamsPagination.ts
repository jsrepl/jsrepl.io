import { useRouter, useSearchParams } from 'next/navigation'

export type UseSearchParamsPaginationProps = {
  scroll?: boolean | (() => void)
}

export type PaginationProps = {
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  goNext: () => void
  goPrevious: () => void
  scroll?: boolean | (() => void)
}

export type UseSearchParamsPaginationReturn = [
  PaginationProps,
  (data: { hasMore: boolean }) => void,
]

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 12

export function useSearchParamsPagination({
  scroll,
}: UseSearchParamsPaginationProps): UseSearchParamsPaginationReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page')) || DEFAULT_PAGE
  const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE

  function setPage(page: number) {
    const newSearchParams = new URLSearchParams(searchParams)
    if (page === DEFAULT_PAGE) {
      newSearchParams.delete('page')
    } else {
      newSearchParams.set('page', page.toString())
    }

    router.push(`?${newSearchParams.toString()}`, {
      scroll: typeof scroll === 'function' ? false : scroll,
    })
  }

  function setPageSize(pageSize: number) {
    const newSearchParams = new URLSearchParams(searchParams)
    if (pageSize === DEFAULT_PAGE_SIZE) {
      newSearchParams.delete('pageSize')
    } else {
      newSearchParams.set('pageSize', pageSize.toString())
    }

    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }

  const value = {
    page,
    pageSize,
    hasNext: false,
    hasPrevious: page > 1,
    setPage,
    setPageSize,
    goNext,
    goPrevious,
    scroll,
  }

  function consumePageData(data: { hasMore: boolean }) {
    value.hasNext = data.hasMore
  }

  function goNext() {
    if (value.hasNext) {
      setPage(page + 1)
    }
  }

  function goPrevious() {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  return [value, consumePageData]
}
