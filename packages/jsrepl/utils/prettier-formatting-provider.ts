import type * as monaco from 'monaco-editor'

export class PrettierFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {
  displayName = 'Prettier'

  async provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.TextEdit[] | null | undefined> {
    const [prettier, typescriptPlugin, estreePlugin] = await Promise.all([
      import('prettier/standalone'),
      import('prettier/plugins/typescript').then((x) => x.default),
      import('prettier/plugins/estree').then((x) => x.default),
    ])

    if (token.isCancellationRequested) {
      return null
    }

    let output: string
    try {
      output = await prettier.format(model.getValue(), {
        parser: 'typescript',
        plugins: [typescriptPlugin, estreePlugin],
        // TODO: make it configurable
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
