import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  save: {
    write: (slotIndex: number, data: unknown) =>
      ipcRenderer.invoke('save:write', slotIndex, data),
    read: (slotIndex: number) =>
      ipcRenderer.invoke('save:read', slotIndex),
    list: () =>
      ipcRenderer.invoke('save:list'),
    delete: (slotIndex: number) =>
      ipcRenderer.invoke('save:delete', slotIndex)
  }
})
