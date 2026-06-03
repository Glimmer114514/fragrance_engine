import { create } from 'zustand'

/**
 * 游戏设置
 *
 * 持久化保存在 localStorage，跨会话保留。
 * 带有版本号检测，当设置结构升级时自动重置为默认值。
 */
export interface Settings {
  /** 文字显示速度 (ms/字)，越小越快 */
  textSpeed: number
  /** 是否开启自动播放 */
  autoPlay: boolean
  /** 自动播放间隔 (ms) */
  autoPlayDelay: number
  /** BGM 音量 0~1 */
  bgmVolume: number
  /** 音效音量 0~1 */
  sfxVolume: number
  /** 是否全屏 */
  fullscreen: boolean
}

/** 设置版本号 —— 修改 Settings 接口后递增此值，旧版本数据将自动重置 */
const SETTINGS_VERSION = 1
const SETTINGS_KEY = 'fragrance_settings'

interface PersistedSettings extends Settings {
  _version: number
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedSettings>
      // 版本不匹配（包括旧数据缺少 _version）→ 重置为默认值
      if (parsed._version === SETTINGS_VERSION) {
        const { _version, ...settings } = parsed
        return { ...defaultSettings, ...settings }
      }
      // 版本过旧，清除并回退到默认值
      localStorage.removeItem(SETTINGS_KEY)
    }
  } catch { /* ignore */ }
  return { ...defaultSettings }
}

function saveSettings(s: Settings) {
  const data: PersistedSettings = { _version: SETTINGS_VERSION, ...s }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
}

const defaultSettings: Settings = {
  textSpeed: 40,
  autoPlay: false,
  autoPlayDelay: 3000,
  bgmVolume: 0.7,
  sfxVolume: 0.8,
  fullscreen: false,
}

interface SettingsStore extends Settings {
  setTextSpeed: (v: number) => void
  setAutoPlay: (v: boolean) => void
  setAutoPlayDelay: (v: number) => void
  setBgmVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  setFullscreen: (v: boolean) => void
  toggleFullscreen: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...loadSettings(),

  setTextSpeed: (v) =>
    set((s) => {
      const next = { ...s, textSpeed: v }
      saveSettings(next)
      return { textSpeed: v }
    }),

  setAutoPlay: (v) =>
    set((s) => {
      const next = { ...s, autoPlay: v }
      saveSettings(next)
      return { autoPlay: v }
    }),

  setAutoPlayDelay: (v) =>
    set((s) => {
      const next = { ...s, autoPlayDelay: v }
      saveSettings(next)
      return { autoPlayDelay: v }
    }),

  setBgmVolume: (v) =>
    set((s) => {
      const next = { ...s, bgmVolume: v }
      saveSettings(next)
      return { bgmVolume: v }
    }),

  setSfxVolume: (v) =>
    set((s) => {
      const next = { ...s, sfxVolume: v }
      saveSettings(next)
      return { sfxVolume: v }
    }),

  setFullscreen: (v) => {
    const next = { ...useSettingsStore.getState(), fullscreen: v }
    saveSettings(next)
    return { fullscreen: v }
  },

  toggleFullscreen: () =>
    set((s) => {
      const next = { ...s, fullscreen: !s.fullscreen }
      saveSettings(next)
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
      return { fullscreen: !s.fullscreen }
    }),
}))
