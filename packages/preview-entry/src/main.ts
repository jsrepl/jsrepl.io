import { consoleLogRepl } from '../../jsrepl/src/lib/console-utils'
import { setupConsole } from './console'
import { postMessage } from './post-message'
import { defer } from './promise-with-resolvers'
import { setupRepl } from './repl'
import type {
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
const postReadyIntervalId = setInterval(() => {
  postMessage(-1, { type: 'ready' })
}, 100)

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

  clearInterval(postReadyIntervalId)

  const data = event.data as ReplMessageData | UpdateThemeMessageData

  if (data.type === 'repl') {
    onReplMessage(data)
  } else if (data.type === 'update-theme') {
    onUpdateThemeMessage(data)
  }
}

async function onReplMessage(data: ReplMessageData) {
  const { token, srcdoc } = data
  currentToken = token

  const iframeToEnter = activeIframe === iframe1 ? iframe2 : iframe1
  const iframeToLeave = activeIframe === iframe1 ? iframe1 : iframe2
  activeIframe = iframeToEnter

  iframeToEnter.style.opacity = '0'
  iframeToEnter.style.pointerEvents = 'none'
  iframeToEnter.srcdoc = srcdoc

  iframeToEnter.classList.add('active')
  iframeToLeave.classList.remove('active')

  afterJsScriptDeferred = defer()
  await Promise.race([afterJsScriptDeferred.promise, new Promise((r) => setTimeout(r, 1000))])
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
  const html = activeIframe?.contentWindow?.document.documentElement
  if (html) {
    html.classList.toggle('dark', data.theme.isDark)
  }
}

function setup(previewWindow: PreviewWindow, token: number) {
  setupRepl(previewWindow, token)
  setupConsole(previewWindow)
  consoleLogRepl('debug', `%c REPL begin (${token})`, 'font-weight: bold;')
}

function afterJsScript(_window: PreviewWindow, token: number) {
  postMessage(token, { type: 'script-complete' })
  afterJsScriptDeferred?.resolve()
}
