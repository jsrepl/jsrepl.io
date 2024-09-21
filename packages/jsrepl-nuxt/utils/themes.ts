//import type * as monaco from 'monaco-editor'
import { Theme, type ThemeDef } from '~/types/repl.types'

export const Themes: ThemeDef[] = [
  // { id: Theme.Light, provider: 'builtin', label: 'Light', isDark: false },
  // { id: Theme.Dark, provider: 'builtin', label: 'Dark', isDark: true },

  { id: Theme.LightPlus, provider: 'shiki', label: 'Light', isDark: false },
  { id: Theme.DarkPlus, provider: 'shiki', label: 'Dark', isDark: true },
  { id: Theme.GithubDark, provider: 'shiki', label: 'GitHub Dark', isDark: true },
  { id: Theme.GithubLight, provider: 'shiki', label: 'GitHub Light', isDark: false },
  { id: Theme.Monokai, provider: 'shiki', label: 'Monokai', isDark: true },
  { id: Theme.Dracula, provider: 'shiki', label: 'Dracula', isDark: true },
  { id: Theme.OneLight, provider: 'shiki', label: 'One Light', isDark: false },

  {
    id: Theme.HighContrastLight,
    provider: 'builtin',
    label: 'High Contrast Light',
    isDark: false,
  },
  {
    id: Theme.HighContrastDark,
    provider: 'builtin',
    label: 'High Contrast Dark',
    isDark: true,
  },

  // {
  //   id: Theme.MonokaiCustom,
  //   provider: 'custom',
  //   label: 'Monokai (custom)',
  //   isDark: true,
  //   load: () => import('monaco-themes/themes/Monokai.json').then(resolveJson),
  // },
]

// function resolveJson(x: { default: unknown }): monaco.editor.IStandaloneThemeData {
//   return x.default as monaco.editor.IStandaloneThemeData
// }
