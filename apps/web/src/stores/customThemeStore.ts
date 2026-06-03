import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeOverrides } from '@md2wechat/core'

interface CustomThemeState {
  panelOpen: boolean
  overrides: ThemeOverrides
  togglePanel: () => void
  setFontSize: (value: number) => void
  setLineHeight: (value: number) => void
  setPrimaryTextColor: (value: string) => void
  setLinkColor: (value: string) => void
  setCodeColor: (value: string) => void
  setParagraphMargin: (value: number) => void
  setHeadingMargin: (value: number) => void
  reset: () => void
  resetFontSize: () => void
}

export const useCustomThemeStore = create<CustomThemeState>()(
  persist(
    (set) => ({
      panelOpen: false,
      overrides: {},
      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
      setFontSize: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, fontSize: value },
        })),
      setLineHeight: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, lineHeight: value },
        })),
      setPrimaryTextColor: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, primaryTextColor: value },
        })),
      setLinkColor: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, linkColor: value },
        })),
      setCodeColor: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, codeColor: value },
        })),
      setParagraphMargin: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, paragraphMargin: value },
        })),
      setHeadingMargin: (value) =>
        set((state) => ({
          overrides: { ...state.overrides, headingMargin: value },
        })),
      reset: () => set({ overrides: {} }),
      resetFontSize: () =>
        set((state) => {
          const next = { ...state.overrides }
          delete (next as Record<string, unknown>).fontSize
          return { overrides: next }
        }),
    }),
    {
      name: 'md2wechat-custom-theme',
    }
  )
)
