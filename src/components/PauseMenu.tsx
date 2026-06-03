import React, { useEffect, useCallback } from 'react'

/**
 * 暂停菜单
 *
 * ESC 按下后显示，覆盖在游戏画面上方。
 * 提供五个选项：返回、存档、读档、设置、退出。
 */
interface Props {
  onBack: () => void
  onSave: () => void
  onLoad: () => void
  onSettings: () => void
  onTitle: () => void
}

export const PauseMenu: React.FC<Props> = ({ onBack, onSave, onLoad, onSettings, onTitle }) => {
  // ESC 关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack()
    }
  }, [onBack])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="pause-menu">
      <div className="pause-panel">
        <div className="pause-title">暂 停</div>

        <button className="pause-btn" onClick={onBack}>
          返 回 游 戏
        </button>
        <button className="pause-btn" onClick={onSave}>
          保 存 进 度
        </button>
        <button className="pause-btn" onClick={onLoad}>
          读 取 存 档
        </button>
        <button className="pause-btn" onClick={onSettings}>
          设 置
        </button>
        <button className="pause-btn exit" onClick={onTitle}>
          返 回 主 页
        </button>
      </div>
    </div>
  )
}
