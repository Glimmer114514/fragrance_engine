import React from 'react'
import { useGameStore } from '../stores/gameStore'
import type { ChoiceOption } from '../engine/types'

/**
 * 选项面板
 *
 * 当引擎遇到 choice 指令时显示。
 * 玩家点击选项后，调用 engine.handleChoice() 决定后续剧情走向。
 */
interface Props {
  onSelect: (option: ChoiceOption) => void
}

export const ChoicePanel: React.FC<Props> = ({ onSelect }) => {
  const phase = useGameStore((s) => s.phase)
  const choicePrompt = useGameStore((s) => s.choicePrompt)
  const choices = useGameStore((s) => s.choices)

  if (phase !== 'choice' || !choices) return null

  return (
    <div className="choice-panel">
      {choicePrompt && <div className="choice-prompt">{choicePrompt}</div>}
      {choices.map((opt, i) => (
        <button key={i} className="choice-button" onClick={() => onSelect(opt)}>
          {opt.text}
        </button>
      ))}
    </div>
  )
}
