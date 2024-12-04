import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default {
  component: null,
}

export const Default = () => {
  return <MyComponent />
}

function MyComponent() {
  const [output, setOutput] = useState<string>('')

  function pushOutput(str: string) {
    setOutput((output) => `> ${new Date().toISOString()} ${str}\n\n${output}`)
  }

  async function log(response: Response | Error) {
    if (response instanceof Error) {
      pushOutput(response.toString())
      console.error(response)
      return
    }

    const isJSON = response.headers.get('content-type')?.includes('application/json')
    const data = isJSON ? await response.json() : await response.text()
    const dataStr: string = isJSON ? JSON.stringify(data, null, 2) : data

    pushOutput(`${response.status} ${response.statusText} ${response.url} ${dataStr}`)

    // eslint-disable-next-line no-console
    console[response.ok ? 'log' : 'error'](response.url, response.status, response.statusText, data)
  }

  async function doFetch(input: string, init?: RequestInit) {
    pushOutput(`${init?.method ?? 'GET'} ${input}`)
    return fetch(input, init)
  }

  async function fetchUserRepls() {
    try {
      const response = await doFetch('/api/repls')
      log(response)
    } catch (e) {
      log(e as Error)
    }
  }

  async function fetchRepl() {
    const id = prompt('Enter repl id')
    if (!id) return

    try {
      const response = await doFetch(`/api/repls/${id}`)
      log(response)
    } catch (e) {
      log(e as Error)
    }
  }

  async function createRepl() {
    try {
      const response = await doFetch('/api/repls', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      log(response)
    } catch (e) {
      log(e as Error)
    }
  }

  async function updateRepl() {
    const id = prompt('Enter repl id')
    if (!id) return

    try {
      const response = await doFetch(`/api/repls/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          id,
        }),
      })
      log(response)
    } catch (e) {
      log(e as Error)
    }
  }

  async function deleteRepl() {
    const id = prompt('Enter repl id')
    if (!id) return

    try {
      const response = await doFetch(`/api/repls/${id}`, { method: 'DELETE' })
      log(response)
    } catch (e) {
      log(e as Error)
    }
  }

  return (
    <>
      <div className="space-x-2">
        <Button variant="secondary" onClick={() => fetchUserRepls()}>
          GetUserRepls
        </Button>
        <Button variant="secondary" onClick={() => fetchRepl()}>
          GetRepl
        </Button>
        <Button variant="secondary" onClick={() => createRepl()}>
          CreateRepl
        </Button>
        <Button variant="secondary" onClick={() => updateRepl()}>
          UpdateRepl
        </Button>
        <Button variant="secondary" onClick={() => deleteRepl()}>
          DeleteRepl
        </Button>
      </div>
      <hr className="my-4" />
      <pre>{output}</pre>
    </>
  )
}
