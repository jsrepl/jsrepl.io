import type { Theme } from '@jsrepl/shared-types'
import type { BundledTheme } from 'shiki'

export const Themes: Theme[] = [
  { id: 'light-plus', label: 'Light', isDark: false },
  { id: 'dark-plus', label: 'Dark', isDark: true },
  { id: 'github-dark', label: 'GitHub Dark', isDark: true },
  { id: 'github-light', label: 'GitHub Light', isDark: false },
  { id: 'monokai', label: 'Monokai', isDark: true },
  { id: 'dracula', label: 'Dracula', isDark: true },
  { id: 'one-light', label: 'One Light', isDark: false },
]

export const defaultThemeId: BundledTheme = 'dark-plus'
