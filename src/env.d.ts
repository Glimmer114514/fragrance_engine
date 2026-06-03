/// <reference types="vite/client" />

interface Window {
  api: {
    save: {
      write: (slotIndex: number, data: unknown) => Promise<void>
      read: (slotIndex: number) => Promise<unknown>
      list: () => Promise<Array<{ slot: number; savedAt: string; label: string }>>
      delete: (slotIndex: number) => Promise<void>
    }
  }
}
