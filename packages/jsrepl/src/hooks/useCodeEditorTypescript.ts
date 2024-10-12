import { RefObject, useCallback, useEffect, useMemo } from 'react'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import type TS from 'typescript'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { DebugLog, debugLog } from '@/lib/debug-log'
import { getDtsMap } from '@/lib/dts'
import { getTypescript } from '@/lib/get-typescript'
import { getNpmPackageFromImportPath } from '@/lib/npm-packages'

export default function useCodeEditorTypescript(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>
) {
  useEffect(() => {
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
  }, [])

  const modelPackages = useMemo(() => new Map<string, { abortController: AbortController }>(), [])
  const [tsRef, loadTS] = useMemo(() => getTypescript(), [])
  const cachedImports = useMemo(() => new Map<monaco.editor.ITextModel, Set<string>>(), [])

  const tsModels: Array<InstanceType<typeof CodeEditorModel>> = useMemo(() => {
    return Array.from(models.values()).filter(
      (model) => model.monacoModel.getLanguageId() === 'typescript'
    )
  }, [models])

  const updateDts = useCallback(() => {
    const ts = tsRef.value!

    const imports = new Set<string>()

    try {
      models.forEach((model) => {
        let _imports = cachedImports.get(model.monacoModel)
        if (!_imports) {
          const sourceFile = ts.createSourceFile(
            model.monacoModel.uri.path,
            model.getValue(),
            ts.ScriptTarget.ESNext,
            true,
            model.monacoModel.uri.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
          )

          _imports = findImports(ts, sourceFile)
          cachedImports.set(model.monacoModel, _imports)
        }

        _imports.forEach((importPath) => imports.add(importPath))
      })
    } catch (e) {
      console.error('jsrepl :: ts :: updateDts', e)
      return
    }

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

      // TODO: do it in parallel
      const dtsMap = await getDtsMap(packageName, tsRef.value!, { signal })
      debugLog(DebugLog.DTS, packageName, 'dtsMap', dtsMap)

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
  }, [tsRef, cachedImports, models, modelPackages])

  const debouncedUpdateDts = useMemo(() => debounce(updateDts, 500), [updateDts])

  useEffect(() => {
    return () => {
      debouncedUpdateDts.clear()
    }
  }, [debouncedUpdateDts])

  useEffect(() => {
    loadTS().then(() => {
      updateDts()
    })
  }, [loadTS, updateDts])

  useEffect(() => {
    const disposables = tsModels.map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        cachedImports.delete(model.monacoModel)
        debouncedUpdateDts()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [tsModels, debouncedUpdateDts, cachedImports])
}

function findImports(ts: typeof TS, sourceFile: TS.SourceFile) {
  const imports = new Set<string>()

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

  ts.forEachChild(sourceFile, findImportsAndExports)

  return imports
}
