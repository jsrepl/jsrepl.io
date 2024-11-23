import {
  AnthropicModel,
  CopilotModel,
  CopilotProvider,
  GroqModel,
  OpenAIModel,
} from '@nag5000/monacopilot'
import { LineNumbers, PreviewPosition, RenderLineHighlight, UserStoredState } from '@/types'

export function load(storage: Storage): UserStoredState {
  let deserialized: UserStoredState | null = null

  try {
    const serialized = storage.getItem('state')
    deserialized = serialized ? deserialize(serialized) : null
  } catch (e) {
    console.error('repl :: user state load error', e)
  }

  const state: UserStoredState = merge(getDefaultState(), deserialized)
  return state
}

export function save(state: UserStoredState, storage: Storage): void {
  try {
    const serialized = serialize(state)
    storage.setItem('state', serialized)
  } catch (e) {
    console.error('repl :: user state save error', e)
  }
}

function deserialize(serialized: string): UserStoredState {
  return JSON.parse(serialized)
}

function serialize(storedState: UserStoredState): string {
  return JSON.stringify(storedState)
}

function merge<T extends object>(target: T, source: T | null): T {
  if (!source) {
    return target
  }

  for (const key in source) {
    if (!(key in target)) {
      continue
    }

    if (Array.isArray(target[key])) {
      if (Array.isArray(source[key])) {
        target[key] = source[key]
      }

      continue
    }

    if (target[key] instanceof Object) {
      if (source[key] instanceof Object) {
        target[key] = merge(target[key], source[key])
      }

      continue
    }

    target[key] = source[key]
  }

  return target
}

export function getDefaultState(): UserStoredState {
  return {
    previewPos: PreviewPosition.FloatBottomRight,
    previewSize: [350, 180],
    showLeftSidebar: true,
    version: undefined,
    leftSidebarWidth: 240,
    autostartOnCodeChange: true,
    editor: {
      fontSize: 14,
      renderLineHighlight: 'none',
      lineNumbers: 'on',
    },
    copilot: {
      apiKey: '',
      provider: 'anthropic',
      model: 'claude-3-5-haiku',
      maxContextLines: 60,
      enableRelatedFiles: true,
      enableCaching: true,
    },
  }
}

export const previewPositionOptions = [
  { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
  { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
  { value: PreviewPosition.AsideRight, label: 'Dock to right' },
]
export const renderLineHighlightOptions: RenderLineHighlight[] = ['none', 'gutter', 'line', 'all']
export const lineNumbersOptions: LineNumbers[] = ['on', 'off', 'relative', 'interval']
export const copilotProviderOptions: CopilotProvider[] = ['anthropic', 'google', 'groq', 'openai']
export const copilotModelOptionsByProvider: {
  [key in CopilotProvider]: CopilotModel[]
} = {
  anthropic: ['claude-3-5-haiku', 'claude-3-5-sonnet', 'claude-3-haiku'] satisfies AnthropicModel[],
  google: ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'] satisfies CopilotModel[],
  groq: ['llama-3-70b'] satisfies GroqModel[],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'o1-preview'] satisfies OpenAIModel[],
}
