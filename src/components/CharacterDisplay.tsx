import React from 'react'
import { useGameStore } from '../stores/gameStore'

/**
 * 角色立绘层组件
 *
 * 根据 store 中的 characters 数组渲染所有可视角色。
 * pos 区分 left / center / right 三个站位。
 */
export const CharacterDisplay: React.FC = () => {
  const characters = useGameStore((s) => s.characters)

  return (
    <div className="character-layer">
      {characters.map((char) => {
        if (!char.visible) return null

        const imgSrc = `../Assets/Resources/Characters/${char.id}/Expressions/${char.id}_${char.pose}.png`

        return (
          <div key={char.id} className={`character-sprite pos-${char.pos}`}>
            <img
              src={imgSrc}
              alt={`${char.id} - ${char.pose}`}
              onError={(e) => {
                // 占位：图片加载失败时显示占位框
                const target = e.currentTarget
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.char-box')) {
                  parent.innerHTML = `
                    <div class="character-placeholder">
                      <div class="char-box">${char.id}<br/>${char.pose}</div>
                      <div class="char-name-tag">${char.id}</div>
                    </div>`
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
