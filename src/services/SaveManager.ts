import type { SaveData } from '../engine/types'
import { useGameStore } from '../stores/gameStore'

/**
 * 存档管理器
 *
 * 封装与主进程的 IPC 通信，处理存档的读写列表删。
 * 渲染进程不能直接操作文件系统，所有 IO 通过 preload 暴露的 api 完成。
 */
export const SaveManager = {
  async write(slotIndex: number): Promise<void> {
    const state = useGameStore.getState()
    const data: SaveData = {
      slot: slotIndex,
      savedAt: new Date().toISOString(),
      label: state.dialogue?.text?.slice(0, 30) ?? '未知场景',
      cursorIndex: state.cursorIndex,
      flags: { ...state.flags }
    }

    if (window.api?.save) {
      await window.api.save.write(slotIndex, data)
    } else {
      // 浏览器开发模式下回退到 localStorage
      localStorage.setItem(`fragrance_save_${slotIndex}`, JSON.stringify(data))
    }
  },

  async read(slotIndex: number): Promise<SaveData | null> {
    if (window.api?.save) {
      return (await window.api.save.read(slotIndex)) as SaveData | null
    } else {
      const raw = localStorage.getItem(`fragrance_save_${slotIndex}`)
      return raw ? JSON.parse(raw) : null
    }
  },

  async list(): Promise<Array<{ slot: number; savedAt: string; label: string }>> {
    if (window.api?.save) {
      return await window.api.save.list()
    } else {
      const list: Array<{ slot: number; savedAt: string; label: string }> = []
      for (let i = 0; i < 10; i++) {
        const raw = localStorage.getItem(`fragrance_save_${i}`)
        if (raw) {
          const data = JSON.parse(raw)
          list.push({ slot: data.slot, savedAt: data.savedAt, label: data.label })
        }
      }
      return list
    }
  },

  async delete(slotIndex: number): Promise<void> {
    if (window.api?.save) {
      await window.api.save.delete(slotIndex)
    } else {
      localStorage.removeItem(`fragrance_save_${slotIndex}`)
    }
  }
}
