import React from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * 对话框组件
 *
 * Galgame 最核心的 UI 元素：
 * - 显示说话人名字
 * - 逐行显示对话文本
 * - 点击触发 engine.continue()
 */
interface Props {
  onAdvance: () => void
}

export const DialogueBox: React.FC<Props> = ({ onAdvance }) => {
  const dialogue = useGameStore((s) => s.dialogue)
  const phase = useGameStore((s) => s.phase)

  if (phase !== 'playing' || !dialogue) return null

  return (
    <div className="dialogue-box" onClick={onAdvance}>
      <div className="dialogue-name">{dialogue.speaker}</div>
      <div className="dialogue-text">{dialogue.text}</div>
      <div className="dialogue-indicator">▼</div>
    </div>
  )
}
