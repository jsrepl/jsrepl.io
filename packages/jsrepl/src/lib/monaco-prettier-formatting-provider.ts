import type * as monaco from 'monaco-editor'
import type { Options, Plugin } from 'prettier'

export const SUPPORTED_FORMATTING_LANGUAGES = ['typescript', 'javascript', 'html', 'css']

export type PrettierEventInit = { type: 'success' } | { type: 'error'; error: unknown }
export type PrettierEvent = CustomEvent<PrettierEventInit>

declare global {
  interface GlobalEventHandlersEventMap {
    'jsrepl-prettier': PrettierEvent
  }
}

export class PrettierFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {
  displayName = 'Prettier'

  async provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.TextEdit[] | null | undefined> {
    try {
      const { prettier, parser, plugins } = await loadPrettier(model)

      if (token.isCancellationRequested) {
        return null
      }

      const output: string = await prettier.format(model.getValue(), {
        parser,
        plugins,
        // TODO: make it configurable (.prettierrc or prettier.config.ts model)
        tabWidth: options.tabSize,
        useTabs: !options.insertSpaces,
        singleQuote: true,
        printWidth: 100,
      })

      if (token.isCancellationRequested) {
        return null
      }

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<PrettierEventInit>('jsrepl-prettier', {
            detail: {
              type: 'success' as const,
            },
          })
        )
      }, 0)

      return [
        {
          text: output,
          range: model.getFullModelRange(),
        },
      ]
    } catch (e) {
      console.warn('Prettier failed to format:', e instanceof Error ? e.message : e)

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<PrettierEventInit>('jsrepl-prettier', {
            detail: {
              type: 'error' as const,
              error: e,
            },
          })
        )
      }, 0)

      return null
    }
  }
}

async function loadPrettier(model: monaco.editor.ITextModel) {
  let pluginPromises: Array<Promise<Plugin>>
  let parser: Options['parser']

  const languageId = model.getLanguageId()
  switch (languageId) {
    case 'typescript':
      parser = 'typescript'
      pluginPromises = [
        import('prettier/plugins/typescript').then((x) => x.default),
        import('prettier/plugins/estree').then((x) => x.default),
      ]
      break
    case 'javascript':
      parser = 'babel'
      pluginPromises = [
        import('prettier/plugins/babel').then((x) => x.default),
        import('prettier/plugins/estree').then((x) => x.default),
      ]
      break
    case 'html':
      parser = 'html'
      pluginPromises = [import('prettier/plugins/html').then((x) => x.default)]
      break
    case 'css':
      parser = 'css'
      pluginPromises = [import('prettier/plugins/postcss').then((x) => x.default)]
      break
    default:
      throw new Error(`Unsupported language: ${languageId}`)
  }

  const [prettier, ...plugins] = await Promise.all([
    import('prettier/standalone'),
    ...pluginPromises,
  ])

  return {
    prettier,
    parser,
    plugins,
  }
}
