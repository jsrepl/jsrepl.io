import { useTypescript } from '@/composables/useTypescript'
import { getDtsMap } from '@/utils/dts'
import { getNpmPackageFromImportPath } from '@/utils/npm-packages'
import type { TailwindConfigModelShared } from '@/utils/tailwind-config-model-shared'
import type { TsxModelShared } from '@/utils/tsx-model-shared'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import type TS from 'typescript'

export function useCodeEditorTypescript(
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null,
  getTsxModelShared: () => TsxModelShared | null,
  getTailwindConfigModelShared: () => TailwindConfigModelShared | null
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

  let sharedModels: Array<TsxModelShared | TailwindConfigModelShared> = []
  const changedModels = new Set<monaco.editor.ITextModel>()
  const cachedImports = new Map<monaco.editor.ITextModel, Set<string>>()

  onMounted(async () => {
    await Promise.all([loadTS()])

    const tsxModelShared = getTsxModelShared()!
    const tailwindConfigModelShared = getTailwindConfigModelShared()!

    sharedModels = [tsxModelShared, tailwindConfigModelShared]

    changedModels.add(tsxModelShared.model)
    changedModels.add(tailwindConfigModelShared.model)

    updateDts()

    tsxModelShared.model.onDidChangeContent(() => {
      changedModels.add(tsxModelShared.model)
      cachedImports.delete(tsxModelShared.model)
      debouncedUpdateDts()
    })

    tailwindConfigModelShared.model.onDidChangeContent(() => {
      changedModels.add(tailwindConfigModelShared.model)
      cachedImports.delete(tailwindConfigModelShared.model)
      debouncedUpdateDts()
    })
  })

  onBeforeUnmount(() => {
    debouncedUpdateDts.clear()
  })

  function updateDts() {
    const _ts = ts.value!

    const imports = new Set<string>()

    try {
      sharedModels.forEach((sharedModel) => {
        // `modelContext.getValue()` is used here instead of `modelContext.getBabelTransformResult().code`
        // to preserve unused imports. Babel transform with typescript plugin removes unused imports.
        const sourceFile = _ts.createSourceFile(
          sharedModel.model.uri.path,
          sharedModel.getValue(),
          _ts.ScriptTarget.ESNext,
          true,
          sharedModel.model.uri.path.endsWith('.tsx') ? _ts.ScriptKind.TSX : _ts.ScriptKind.TS
        )

        const _imports = findImports(sourceFile)
        _imports.forEach((importPath) => imports.add(importPath))
      })
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

      // TODO: await Promise.all of addedPackages?
      const dtsMap = await getDtsMap(packageName, ts.value!, { signal })
      debug(Debug.DTS, packageName, 'dtsMap', dtsMap)

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

    changedModels.clear()
  }

  function findImports(sourceFile: TS.SourceFile) {
    const _ts = ts.value!
    const imports = new Set<string>()

    function findImportsAndExports(node: TS.Node) {
      // if (ts.isImportDeclaration(node)) {
      //   console.log('Import:', node.moduleSpecifier.getText());
      // } else if (ts.isExportDeclaration(node)) {
      //   console.log('Export:', node.moduleSpecifier ? node.moduleSpecifier.getText() : 'Export with no module');
      // } else if (ts.isExportAssignment(node)) {
      //   console.log('Export assignment:', node.expression.getText());
      // }

      if (_ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier as TS.StringLiteral
        if (moduleSpecifier.text) {
          imports.add(moduleSpecifier.text)
        }
      }

      _ts.forEachChild(node, findImportsAndExports)
    }

    _ts.forEachChild(sourceFile, findImportsAndExports)

    return imports
  }
}
