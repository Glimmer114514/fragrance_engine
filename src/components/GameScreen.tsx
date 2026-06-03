import React, { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import { scriptEngine } from '../engine/ScriptEngine'
import { SaveManager } from '../services/SaveManager'

import { Background } from './Background'
import { CharacterDisplay } from './CharacterDisplay'
import { DialogueBox } from './DialogueBox'
import { NarrationOverlay } from './NarrationOverlay'
import { ChoicePanel } from './ChoicePanel'
import { TitleScreen } from './TitleScreen'
import { SaveLoadScreen } from './SaveLoadScreen'
import { PauseMenu } from './PauseMenu'
import { SettingsPanel } from './SettingsPanel'

/**
 * 主游戏画面
 *
 * 根据 gameStore.phase 决定显示哪个子界面，
 * 并处理所有用户交互（点击继续、选择选项、开始/存档/读档）。
 */
export const GameScreen: React.FC = () => {
  const phase = useGameStore((s) => s.phase)
  const prevPhaseRef = useRef(phase)

  // ── 检测游戏通关，标记二周目 ──
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = phase
    if (
      prev !== 'title' &&
      prev !== 'save' &&
      prev !== 'load' &&
      phase === 'title'
    ) {
      localStorage.setItem('fragrance_completed', '1')
    }
  }, [phase])

  // 点击继续 (对话/旁白)
  const handleAdvance = useCallback(() => {
    scriptEngine.continue()
  }, [])

  // 选择选项
  const handleChoice = useCallback((option: any) => {
    scriptEngine.handleChoice(option)
  }, [])

  // 加载剧本的通用方法
  const loadScript = useCallback(async () => {
    const script = await import('../../resources/scripts/main_story.json')
    const commands = (script as any).default ?? script
    scriptEngine.load(Array.isArray(commands) ? commands : [])
    return commands
  }, [])

  // 开始新游戏
  const handleStart = useCallback(async () => {
    const store = useGameStore.getState()
    store.resetGame()
    if (localStorage.getItem('fragrance_completed') === '1') {
      store.setFlag('week2', true)
    }
    try {
      await loadScript()
      store.setPhase('playing')
      scriptEngine.advance(0)
    } catch (err) {
      console.error('加载剧本失败:', err)
    }
  }, [loadScript])

  // 继续游戏
  const handleContinue = useCallback(async () => {
    const saves = await SaveManager.list()
    if (saves.length === 0) return
    saves.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    const latest = saves[0]
    const data = await SaveManager.read(latest.slot)
    if (!data) return
    const store = useGameStore.getState()
    store.resetGame()
    store.loadFlags(data.flags)
    try {
      await loadScript()
      store.setPhase('playing')
      scriptEngine.advance(data.cursorIndex)
    } catch (err) {
      console.error('读档失败:', err)
    }
  }, [loadScript])

  // 读档
  const handleLoad = useCallback(async (slotIndex: number) => {
    const data = await SaveManager.read(slotIndex)
    if (!data) return
    const store = useGameStore.getState()
    store.resetGame()
    store.loadFlags(data.flags)
    try {
      await loadScript()
      store.setPhase('playing')
      scriptEngine.advance(data.cursorIndex)
    } catch (err) {
      console.error('读档失败:', err)
    }
  }, [loadScript])

  // 相册
  const handleAlbum = useCallback(() => {
    console.log('[相册] 功能开发中')
  }, [])

  // 退出 —— 返回标题画面
  const handleExitToTitle = useCallback(() => {
    const store = useGameStore.getState()
    store.setPhase('title')
  }, [])

  // --- 界面状态: game | pause | save | load | settings ---
  const [uiMode, setUiMode] = React.useState<'game' | 'pause' | 'save' | 'load' | 'settings'>('game')

  const backToGame = useCallback(() => setUiMode('game'), [])
  const openPause = useCallback(() => setUiMode('pause'), [])
  const openSave = useCallback(() => setUiMode('save'), [])
  const openLoad = useCallback(() => setUiMode('load'), [])
  const openSettings = useCallback(() => setUiMode('settings'), [])

  // ── 1. 全屏 ESC 冲突修复 ──
  // 阻止浏览器在按 ESC 时自动退出全屏，改用我们的 fullscreenchange 监听来同步状态
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()

        if (uiMode !== 'game') {
          backToGame()
        } else if (phase === 'playing' || phase === 'narration' || phase === 'choice') {
          openPause()
        }
      }
    }

    // 当用户通过其他方式退出全屏时（如 F11、窗口控件），同步 store 状态
    const onFullscreenChange = () => {
      const actual = !!document.fullscreenElement
      const store = useSettingsStore.getState()
      if (store.fullscreen !== actual) {
        store.setFullscreen(actual)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [uiMode, phase, backToGame, openPause])

  // ── 2. 自动播放 ──
  const autoPlayOn = useSettingsStore((s) => s.autoPlay)
  const autoPlayDelay = useSettingsStore((s) => s.autoPlayDelay)
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 清除旧定时器
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }

    // 条件：自动播放开启 + 在游戏状态 + 处于播放/旁白阶段（非选项、非暂停）
    if (
      !autoPlayOn ||
      uiMode !== 'game' ||
      (phase !== 'playing' && phase !== 'narration')
    ) {
      return
    }

    autoPlayTimerRef.current = setTimeout(() => {
      handleAdvance()
    }, autoPlayDelay)

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
      }
    }
  }, [autoPlayOn, autoPlayDelay, phase, uiMode, handleAdvance])

  // 存档/读档界面
  if (uiMode === 'save') {
    return <SaveLoadScreen mode="save" onBack={backToGame} onLoadSlot={handleLoad} />
  }
  if (uiMode === 'load') {
    return <SaveLoadScreen mode="load" onBack={backToGame} onLoadSlot={handleLoad} />
  }

  // 标题画面
  if (phase === 'title') {
    return (
      <>
        <TitleScreen
          onStart={handleStart}
          onContinue={handleContinue}
          onAlbum={handleAlbum}
          onSettings={openSettings}
          onExit={() => window.close()}
        />
        {uiMode === 'settings' && (
          <SettingsPanel onBack={backToGame} />
        )}
      </>
    )
  }

  // 游戏画面 (可能叠加暂停菜单 / 设置面板)
  return (
    <div className="game-stage">
      <Background />
      <CharacterDisplay />
      <NarrationOverlay onAdvance={handleAdvance} />
      <DialogueBox onAdvance={handleAdvance} />
      <ChoicePanel onSelect={handleChoice} />
      {uiMode === 'pause' && (
        <PauseMenu
          onBack={backToGame}
          onSave={openSave}
          onLoad={openLoad}
          onSettings={openSettings}
          onTitle={handleExitToTitle}
        />
      )}
      {uiMode === 'settings' && (
        <SettingsPanel onBack={backToGame} />
      )}
    </div>
  )
}
