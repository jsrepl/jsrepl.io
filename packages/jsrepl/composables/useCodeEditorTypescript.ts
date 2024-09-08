import { useBabel } from '@/composables/useBabel'
import { useTypescript } from '@/composables/useTypescript'
import { getDtsMap } from '@/utils/dts'
import { getNpmPackageFromImportPath } from '@/utils/npm-packages'
import type { TsxModelShared } from '@/utils/tsx-model-shared'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import type TS from 'typescript'

export function useCodeEditorTypescript(
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null,
  getTsxModelShared: () => TsxModelShared | null
) {
  const modelPackages = new Map<string, { abortController: AbortController }>()

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    // https://www.typescriptlang.org/tsconfig/#allowSyntheticDefaultImports
    allowSyntheticDefaultImports: true,

    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    allowJs: true,
    esModuleInterop: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,

    // https://github.com/microsoft/monaco-editor/issues/2976
    isolatedModules: true,

    // https://github.com/microsoft/monaco-editor/issues/2976
    moduleDetection: 3 /* Force (undocumented, https://raw.githubusercontent.com/microsoft/monaco-editor/93a0a2df32926aa86f7e11bc71a43afaea581a09/src/language/typescript/lib/typescriptServices.js, look for "moduleDetection") */,
  })

  const debouncedUpdateDts = debounce(updateDts, 500)
  const [ts, loadTS] = useTypescript()
  const [babel, loadBabel] = useBabel()

  onMounted(async () => {
    await Promise.all([loadTS(), loadBabel()])

    const tsxModelShared = getTsxModelShared()!
    updateDts()

    tsxModelShared.model.onDidChangeContent(() => {
      debouncedUpdateDts()
    })
  })

  onBeforeUnmount(() => {
    debouncedUpdateDts.clear()
  })

  function updateDts() {
    const tsxModelShared = getTsxModelShared()!
    const { error } = tsxModelShared.getBabelTransformResult(babel.value!)
    if (error) {
      return
    }

    const imports = new Set<string>()

    try {
      // `modelContext.getValue()` is used here instead of `modelContext.getBabelTransformResult().code`
      // to preserve unused imports. Babel transform with typescript plugin removes unused imports.
      processSourceCode(ts.value!, tsxModelShared.getValue(), imports)
    } catch (e) {
      console.error('jsrepl :: ts :: updateDts', e)
      return
    }

    // `imports` is used here instead of `modelContext.getBabelTransformResult().metadata.importPaths`
    // to preserve unused imports. Babel transform with typescript plugin removes unused imports.
    // It's better to eagerly preload types even before import is actually used in the code.
    const packages = new Set(
      Array.from(imports)
        .map((importPath) => getNpmPackageFromImportPath(importPath))
        .filter((moduleName) => moduleName !== null)
    )

    // TODO: support packages with version specifier: `react@18.2.0`
    if (
      packages.has('react') ||
      packages.has('react-dom/client') ||
      packages.has('react-dom/client.development')
    ) {
      packages.add('react/jsx-runtime')
    }

    const addedPackages = Array.from(packages).filter(
      (packageName) => !modelPackages.has(packageName)
    )
    const removedPackages = Array.from(modelPackages.keys()).filter(
      (packageName) => !packages.has(packageName)
    )

    removedPackages.forEach((packageName) => {
      const { abortController } = modelPackages.get(packageName)!
      abortController.abort()
      modelPackages.delete(packageName)
    })

    addedPackages.forEach(async (packageName) => {
      const abortController = new AbortController()
      const { signal } = abortController
      modelPackages.set(packageName, { abortController })

      const dtsMap = await getDtsMap(packageName, ts.value!, { signal })
      for (const [fileUri, content] of dtsMap) {
        if (signal.aborted) {
          return
        }

        const disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          fileUri
        )

        signal.addEventListener('abort', () => {
          disposable.dispose()
        })
      }
    })

    if (addedPackages.length > 0 || removedPackages.length > 0) {
      const paths = Array.from(packages).reduce(
        (acc, packageName) => {
          acc[`https://esm.sh/${packageName}`] = [`file:///node_modules/${packageName}`]
          return acc
        },
        {} as Record<string, string[]>
      )

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        paths,
      })
    }
  }

  function processSourceCode(
    ts: typeof import('typescript'),
    sourceCode: string,
    imports: Set<string>
  ) {
    const tsSourceFile = ts.createSourceFile(
      'index.tsx',
      sourceCode,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX
    )

    function findImportsAndExports(node: TS.Node) {
      // if (ts.isImportDeclaration(node)) {
      //   console.log('Import:', node.moduleSpecifier.getText());
      // } else if (ts.isExportDeclaration(node)) {
      //   console.log('Export:', node.moduleSpecifier ? node.moduleSpecifier.getText() : 'Export with no module');
      // } else if (ts.isExportAssignment(node)) {
      //   console.log('Export assignment:', node.expression.getText());
      // }

      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier as TS.StringLiteral
        if (moduleSpecifier.text) {
          imports.add(moduleSpecifier.text)
        }
      }

      ts.forEachChild(node, findImportsAndExports)
    }

    ts.forEachChild(tsSourceFile, findImportsAndExports)
  }
}
