import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SaveManager } from '../services/SaveManager'

/**
 * 标题画面 —— 「余香」
 *
 * 复刻 main_menu.html 的完整视觉设计：
 * - 暖色渐变背景 + 纸张纹理
 * - 飘落花瓣系统
 * - 光斑脉动
 * - 自定义钢笔尖光标
 * - 装饰线 & 标题 & 菜单按钮渐进动画
 */
interface Props {
  onStart: () => void
  onContinue: () => void
  onAlbum: () => void
  onSettings: () => void
  onExit: () => void
}

const PETAL_COLORS = [
  'rgba(244, 194, 194, 0.5)',
  'rgba(232, 213, 183, 0.45)',
  'rgba(212, 165, 165, 0.55)',
  'rgba(240, 200, 190, 0.5)',
  'rgba(255, 220, 210, 0.4)',
  'rgba(220, 180, 160, 0.45)',
  'rgba(245, 200, 185, 0.5)',
  'rgba(235, 210, 195, 0.4)',
]

interface PetalData {
  id: number
  left: number
  size: number
  color: string
  duration: number
  delay: number
  drift: number
  shadowColor: string
}

function generatePetals(count: number): PetalData[] {
  return Array.from({ length: count }, (_, i) => {
    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
    const size = 12 + Math.random() * 18
    const duration = 14 + Math.random() * 22
    const delay = Math.random() * 15
    const drift = (Math.random() - 0.5) * 200
    const shadowColor = color.replace('0.5', '0.15').replace('0.45', '0.12').replace('0.55', '0.15').replace('0.4', '0.12')

    return {
      id: i,
      left: Math.random() * 100,
      size,
      color,
      duration,
      delay,
      drift: drift * 0.5 + (Math.random() - 0.5) * 80,
      shadowColor,
    }
  })
}

export const TitleScreen: React.FC<Props> = ({ onStart, onContinue, onAlbum, onSettings, onExit }) => {
  const phase = useGameStore((s) => s.phase)
  const [petals] = useState<PetalData[]>(() => generatePetals(28))
  const [hasSaves, setHasSaves] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const cursorPosRef = useRef({ cx: 0, cy: 0, px: 0, py: 0 })
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  if (phase !== 'title') return null

  // ── 检测是否有存档（控制「继续」按钮半透明） ──
  useEffect(() => {
    SaveManager.list().then((list) => setHasSaves(list.length > 0))
  }, [])

  // ── 自定义光标 ──
  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMouseMove = (e: MouseEvent) => {
      cursorPosRef.current.px = e.clientX
      cursorPosRef.current.py = e.clientY
    }

    const animate = () => {
      const { cx, cy, px, py } = cursorPosRef.current
      const nx = cx + (px - cx) * 0.22
      const ny = cy + (py - cy) * 0.22
      cursorPosRef.current.cx = nx
      cursorPosRef.current.cy = ny
      cursor.style.left = nx + 'px'
      cursor.style.top = ny + 'px'
      animFrameRef.current = requestAnimationFrame(animate)
    }

    // hover / click 效果
    const addHover = () => cursor.classList.add('hover')
    const removeHover = () => cursor.classList.remove('hover')
    const addClick = () => cursor.classList.add('click')
    const removeClick = () => cursor.classList.remove('click')

    // 给所有交互元素绑定 hover
    const interactables = document.querySelectorAll('.menu-btn, .title-interactable')
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', addClick)
    document.addEventListener('mouseup', removeClick)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', addClick)
      document.removeEventListener('mouseup', removeClick)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', addHover)
        el.removeEventListener('mouseleave', removeHover)
      })
    }
  }, [])

  // ── 按钮点击动画 ──
  const animateBtn = useCallback((el: HTMLButtonElement | null, onComplete?: () => void) => {
    if (!el) return
    el.style.transform = 'scale(0.96)'
    el.style.transition = 'all 0.2s ease'
    setTimeout(() => {
      if (onComplete) onComplete()
    }, 200)
    setTimeout(() => {
      el.style.transform = ''
    }, 400)
  }, [])

  const handleStart = useCallback(() => {
    const btn = btnRefs.current.get('start')
    animateBtn(btn, onStart)
  }, [animateBtn, onStart])

  const handleContinue = useCallback(() => {
    if (!hasSaves) return
    const btn = btnRefs.current.get('continue')
    animateBtn(btn, onContinue)
  }, [animateBtn, hasSaves, onContinue])

  const handleAlbum = useCallback(() => {
    const btn = btnRefs.current.get('album')
    animateBtn(btn, onAlbum)
  }, [animateBtn, onAlbum])

  const handleSettings = useCallback(() => {
    const btn = btnRefs.current.get('settings')
    animateBtn(btn, onSettings)
  }, [animateBtn, onSettings])

  const handleExit = useCallback(() => {
    const btn = btnRefs.current.get('exit')
    if (btn) {
      btn.style.transform = 'scale(0.96)'
      btn.style.opacity = '0.5'
      btn.style.transition = 'all 0.4s ease'
      setTimeout(onExit, 400)
    } else {
      onExit()
    }
  }, [onExit])

  // ── 键盘操作 ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onStart()
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onStart, onExit])

  return (
    <div className="title-screen-new">
      {/* 背景纹理 */}
      <div className="ts-bg-texture" />

      {/* 光斑 */}
      <div className="ts-light-spots">
        <div className="ts-light-spot" />
        <div className="ts-light-spot" />
        <div className="ts-light-spot" />
      </div>

      {/* 花瓣 */}
      <div className="ts-petals-container">
        {petals.map((p) => (
          <div
            key={p.id}
            className="ts-petal"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              background: p.color,
              boxShadow: `0 0 12px ${p.shadowColor}`,
              '--duration': `${p.duration}s`,
              '--delay': `-${p.delay}s`,
              '--drift': `${p.drift}px`,
              transformOrigin: 'center center',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 自定义光标 */}
      <div className="ts-custom-cursor" ref={cursorRef}>
        <div className="ts-nib">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="m15.54 3.5l4.96 4.97l-1.43 1.41l-4.95-4.95zM3.5 19.78l6.5-6.47c-.1-.31-.03-.7.23-.96c.39-.39 1.03-.39 1.42 0c.39.4.39 1.03 0 1.42c-.26.26-.65.33-.96.23l-6.47 6.5l10.61-3.55l3.53-6.36l-4.94-4.95l-6.37 3.53z" />
          </svg>
        </div>
      </div>

      {/* 主容器 */}
      <div className="ts-main-container">
        {/* 顶部装饰线 */}
        <div className="ts-ornament-top">
          <span className="ts-ornament-line" />
          <span className="ts-ornament-flower">✿</span>
          <span className="ts-ornament-line" />
        </div>

        {/* 标题 */}
        <div className="ts-title-area">
          <div className="ts-title-main">余香</div>
          <div className="ts-title-sub">Fragrance</div>
        </div>

        {/* 中部装饰线 */}
        <div className="ts-ornament-mid">
          <span className="ts-diamond" />
          <span className="ts-line-long" />
          <span className="ts-diamond" style={{ opacity: 0.6 }} />
          <span className="ts-line-long" />
          <span className="ts-diamond" style={{ opacity: 0.3 }} />
        </div>

        {/* 菜单按钮 */}
        <div className="ts-menu">
          <button
            className="menu-btn"
            ref={(el) => { if (el) btnRefs.current.set('start', el) }}
            onClick={handleStart}
          >
            开 始 游 戏
          </button>
          <button
            className={`menu-btn${!hasSaves ? ' dim' : ''}`}
            ref={(el) => { if (el) btnRefs.current.set('continue', el) }}
            onClick={handleContinue}
          >
            继 续
          </button>
          <button
            className="menu-btn"
            ref={(el) => { if (el) btnRefs.current.set('album', el) }}
            onClick={handleAlbum}
          >
            相 册
          </button>
          <button
            className="menu-btn"
            ref={(el) => { if (el) btnRefs.current.set('settings', el) }}
            onClick={handleSettings}
          >
            设 置
          </button>
          <button
            className="menu-btn"
            ref={(el) => { if (el) btnRefs.current.set('exit', el) }}
            onClick={handleExit}
          >
            退 出
          </button>
        </div>
      </div>

    </div>
  )
}
