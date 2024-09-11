import type { ThemeDef } from '../../jsrepl/types/repl.types'
import { setupConsole } from './console'
import { postMessage } from './post-message'
import { defer } from './promise-with-resolvers'
import { setupRepl } from './repl'
import type {
  ImportMap,
  PreviewEntryWindow,
  PreviewWindow,
  ReplMessageData,
  UpdateThemeMessageData,
} from './types'

const JSREPL_ORIGIN = __JSREPL_ORIGIN__
let currentToken: number | undefined
let afterJsScriptDeferred: PromiseWithResolvers<void> | undefined

const iframe1 = createIframe()
iframe1.id = 'preview1'
iframe1.classList.add('preview')
document.body.appendChild(iframe1)

const iframe2 = createIframe()
iframe2.id = 'preview2'
iframe2.classList.add('preview')
document.body.appendChild(iframe2)

let activeIframe: HTMLIFrameElement | null = null

const previewEntryWindow = window as PreviewEntryWindow
previewEntryWindow.hooks = { setup, afterJsScript }
previewEntryWindow.addEventListener('message', onMessage)

postMessage(-1, { type: 'ready' })

function createIframe() {
  const el = document.createElement('iframe')
  el.style.border = '0'
  el.style.position = 'fixed'
  el.style.inset = '0'
  el.style.width = '100%'
  el.style.height = '100%'
  return el
}

function onMessage(event: MessageEvent) {
  if (event.origin !== JSREPL_ORIGIN || event.data?.source !== 'jsrepl') {
    return
  }

  const data = event.data as ReplMessageData | UpdateThemeMessageData

  if (data.type === 'repl') {
    onReplMessage(data)
  }

  if (data.type === 'update-theme') {
    onUpdateThemeMessage(data)
  }
}

async function onReplMessage(data: ReplMessageData) {
  const { token, jsCode, htmlCode, cssCode, importmap, theme } = data
  currentToken = token

  const iframeToEnter = activeIframe === iframe1 ? iframe2 : iframe1
  const iframeToLeave = activeIframe === iframe1 ? iframe1 : iframe2
  activeIframe = iframeToEnter

  iframeToEnter.style.opacity = '0'
  iframeToEnter.style.pointerEvents = 'none'
  iframeToEnter.srcdoc = getIframeTemplate(importmap, jsCode, htmlCode, cssCode, theme, token)

  iframeToEnter.classList.add('active')
  iframeToLeave.classList.remove('active')

  afterJsScriptDeferred = defer()
  await Promise.race([afterJsScriptDeferred.promise, new Promise((r) => setTimeout(r, 250))])
  if (currentToken !== token) {
    return
  }

  iframeToEnter.style.opacity = ''
  iframeToEnter.style.pointerEvents = ''

  iframeToLeave.style.opacity = '0'
  iframeToLeave.style.pointerEvents = 'none'
  iframeToLeave.srcdoc = ''
}

function onUpdateThemeMessage(data: UpdateThemeMessageData) {
  const { theme } = data
  const html = activeIframe?.contentWindow?.document.documentElement
  html?.classList.toggle('dark', theme.isDark)
}

function getIframeTemplate(
  importmap: ImportMap,
  jsCode: string,
  htmlCode: string,
  cssCode: string,
  theme: Pick<ThemeDef, 'id' | 'isDark'>,
  token: number
) {
  const newDoc = document.implementation.createHTMLDocument('JSRepl Preview')

  newDoc.documentElement.dataset.token = token.toString()
  newDoc.documentElement.classList.toggle('dark', theme.isDark)

  const importmapScript = newDoc.createElement('script')
  importmapScript.type = 'importmap'
  importmapScript.textContent = JSON.stringify(importmap)
  newDoc.head.appendChild(importmapScript)

  const setupScript = newDoc.createElement('script')
  setupScript.type = 'module'
  setupScript.textContent = `window.parent.hooks.setup(window, ${token})`
  newDoc.head.appendChild(setupScript)

  const cssStyle = newDoc.createElement('style')
  cssStyle.textContent = cssCode
  newDoc.head.appendChild(cssStyle)

  const jsScript = document.createElement('script')
  jsScript.id = 'repl-script'
  jsScript.type = 'module'
  // `${jsCode}` must be at col 0 to compute correct colno in error stack, see window.onerror handler.
  jsScript.textContent = `\n${jsCode}\n`
  newDoc.head.appendChild(jsScript)

  const afterJsScript = newDoc.createElement('script')
  afterJsScript.type = 'module'
  afterJsScript.textContent = `window.parent.hooks.afterJsScript(window, ${token})`
  newDoc.head.appendChild(afterJsScript)

  newDoc.body.innerHTML = htmlCode

  return newDoc.documentElement.outerHTML
}

function setup(previewWindow: PreviewWindow, token: number) {
  setupRepl(previewWindow, token)
  setupConsole(previewWindow)

  if (previewWindow.document.body.hasChildNodes()) {
    bodyMutation(token)
  } else {
    const observer = new previewWindow.MutationObserver(() => {
      observer.disconnect()
      bodyMutation(token)
    })

    observer.observe(previewWindow.document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    })
  }

  previewWindow.console.debug('%cREPL begin (%s)', 'font-weight: bold;', token)
}

function afterJsScript(_window: PreviewWindow, token: number) {
  postMessage(token, { type: 'script-complete' })
  afterJsScriptDeferred?.resolve()
}

function bodyMutation(token: number) {
  postMessage(token, { type: 'body-mutation' })
}
