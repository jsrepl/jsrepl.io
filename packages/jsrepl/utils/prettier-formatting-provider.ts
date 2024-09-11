import type * as monaco from 'monaco-editor'
import type { Options, Plugin } from 'prettier'

export class PrettierFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {
  displayName = 'Prettier'

  async provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.TextEdit[] | null | undefined> {
    let pluginPromises: Array<Promise<Plugin>>
    let parser: Options['parser']

    switch (model.getLanguageId()) {
      case 'typescript':
        parser = 'typescript'
        pluginPromises = [
          import('prettier/plugins/typescript').then((x) => x.default),
          import('prettier/plugins/estree').then((x) => x.default),
        ]
        break
      case 'javascript':
        parser = 'babel'
        pluginPromises = [import('prettier/plugins/babel').then((x) => x.default)]
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
        return null
    }

    const [prettier, ...plugins] = await Promise.all([
      import('prettier/standalone'),
      ...pluginPromises,
    ])

    if (token.isCancellationRequested) {
      return null
    }

    let output: string
    try {
      output = await prettier.format(model.getValue(), {
        parser,
        plugins,
        // TODO: make it configurable (.prettierrc or prettier.config.ts model)
        tabWidth: options.tabSize,
        useTabs: !options.insertSpaces,
        singleQuote: true,
        printWidth: 100,
      })
    } catch (e) {
      console.warn('Prettier failed to format:', e instanceof Error ? e.message : e)
      return null
    }

    if (token.isCancellationRequested) {
      return null
    }

    return [
      {
        text: output,
        range: model.getFullModelRange(),
      },
    ]
  }
}
