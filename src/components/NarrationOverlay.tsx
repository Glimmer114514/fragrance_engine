import React from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * 旁白层
 *
 * 全屏半透明黑底 + 居中斜体文字
 */
interface Props {
  onAdvance: () => void
}

export const NarrationOverlay: React.FC<Props> = ({ onAdvance }) => {
  const narration = useGameStore((s) => s.narration)
  const phase = useGameStore((s) => s.phase)

  if (phase !== 'narration' || !narration) return null

  return (
    <div className="narration-layer" onClick={onAdvance}>
      <p className="narration-text">{narration}</p>
    </div>
  )
}
