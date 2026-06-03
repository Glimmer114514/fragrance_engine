import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'

const isDev = !app.isPackaged

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    fullscreenable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    // electron-vite 自动设置的环境变量
    const url = process.env['ELECTRON_RENDERER_URL'] ?? 'http://localhost:5199'
    mainWindow.loadURL(url)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- 存档目录 ---
function getSaveDir(): string {
  const dir = join(app.getPath('userData'), 'saves')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

// --- IPC 存档操作 ---
ipcMain.handle('save:write', async (_event, slotIndex: number, data: unknown) => {
  const saveDir = getSaveDir()
  const filePath = join(saveDir, `slot_${slotIndex}.json`)
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
})

ipcMain.handle('save:read', async (_event, slotIndex: number) => {
  const saveDir = getSaveDir()
  const filePath = join(saveDir, `slot_${slotIndex}.json`)
  if (!existsSync(filePath)) return null
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
})

ipcMain.handle('save:list', async () => {
  const saveDir = getSaveDir()
  try {
    const files = readdirSync(saveDir).filter(f => f.startsWith('slot_') && f.endsWith('.json'))
    return files.map(f => {
      const raw = readFileSync(join(saveDir, f), 'utf-8')
      const data = JSON.parse(raw)
      return { slot: data.slot, savedAt: data.savedAt, label: data.label }
    })
  } catch {
    return []
  }
})

ipcMain.handle('save:delete', async (_event, slotIndex: number) => {
  const saveDir = getSaveDir()
  const filePath = join(saveDir, `slot_${slotIndex}.json`)
  if (existsSync(filePath)) unlinkSync(filePath)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
