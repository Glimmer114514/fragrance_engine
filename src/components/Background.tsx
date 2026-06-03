import React from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * 背景层组件
 * 根据 store 中的 background state 渲染场景背景
 */
export const Background: React.FC = () => {
  const background = useGameStore((s) => s.background)

  if (!background) {
    return (
      <div className="background-layer">
        <div className="background-placeholder" />
      </div>
    )
  }

  return (
    <div className={`background-layer ${background.effect === 'fadeOut' ? 'fade-out' : ''}`}>
      <img src={background.src} alt="background" />
    </div>
  )
}
