import React, { useEffect, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

interface Props {
  onBack: () => void
}

/**
 * 设置面板
 *
 * 游戏内的设置菜单，通过暂停菜单或标题画面进入。
 * 包含：文字速度、自动播放、BGM音量、音效音量、全屏。
 */
export const SettingsPanel: React.FC<Props> = ({ onBack }) => {
  const s = useSettingsStore()

  // ESC 关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    },
    [onBack]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 文字速度标签
  const speedLabel =
    s.textSpeed <= 15 ? '极快' : s.textSpeed <= 30 ? '较快' : s.textSpeed <= 50 ? '标准' : s.textSpeed <= 70 ? '较慢' : '极慢'

  // 自动播放间隔标签
  const delayLabel = `${(s.autoPlayDelay / 1000).toFixed(1)}s`

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-title">设 置</div>

        {/* 文字速度 */}
        <div className="setting-row">
          <span className="setting-label">文字速度</span>
          <div className="setting-control">
            <button
              className="setting-adj"
              onClick={() => s.setTextSpeed(Math.max(5, s.textSpeed - 10))}
            >
              ◀
            </button>
            <span className="setting-value">{speedLabel}</span>
            <button
              className="setting-adj"
              onClick={() => s.setTextSpeed(Math.min(100, s.textSpeed + 10))}
            >
              ▶
            </button>
          </div>
        </div>

        {/* 自动播放 */}
        <div className="setting-row">
          <span className="setting-label">自动播放</span>
          <div className="setting-control">
            <button
              className={`setting-toggle ${s.autoPlay ? 'on' : ''}`}
              onClick={() => s.setAutoPlay(!s.autoPlay)}
            >
              {s.autoPlay ? '开' : '关'}
            </button>
            {s.autoPlay && (
              <>
                <span className="setting-sep">|</span>
                <button
                  className="setting-adj"
                  onClick={() => s.setAutoPlayDelay(Math.max(1000, s.autoPlayDelay - 500))}
                >
                  ◀
                </button>
                <span className="setting-value">{delayLabel}</span>
                <button
                  className="setting-adj"
                  onClick={() => s.setAutoPlayDelay(Math.min(10000, s.autoPlayDelay + 500))}
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </div>

        {/* BGM 音量 */}
        <div className="setting-row">
          <span className="setting-label">背景音乐</span>
          <div className="setting-control">
            <button className="setting-adj" onClick={() => s.setBgmVolume(Math.max(0, +(s.bgmVolume - 0.1).toFixed(1)))}>
              ◀
            </button>
            <div className="setting-bar-track">
              <div className="setting-bar-fill" style={{ width: `${s.bgmVolume * 100}%` }} />
            </div>
            <span className="setting-pct">{Math.round(s.bgmVolume * 100)}%</span>
            <button className="setting-adj" onClick={() => s.setBgmVolume(Math.min(1, +(s.bgmVolume + 0.1).toFixed(1)))}>
              ▶
            </button>
          </div>
        </div>

        {/* 音效音量 */}
        <div className="setting-row">
          <span className="setting-label">音效音量</span>
          <div className="setting-control">
            <button className="setting-adj" onClick={() => s.setSfxVolume(Math.max(0, +(s.sfxVolume - 0.1).toFixed(1)))}>
              ◀
            </button>
            <div className="setting-bar-track">
              <div className="setting-bar-fill" style={{ width: `${s.sfxVolume * 100}%` }} />
            </div>
            <span className="setting-pct">{Math.round(s.sfxVolume * 100)}%</span>
            <button className="setting-adj" onClick={() => s.setSfxVolume(Math.min(1, +(s.sfxVolume + 0.1).toFixed(1)))}>
              ▶
            </button>
          </div>
        </div>

        {/* 全屏 */}
        <div className="setting-row">
          <span className="setting-label">全屏模式</span>
          <div className="setting-control">
            <button
              className={`setting-toggle ${s.fullscreen ? 'on' : ''}`}
              onClick={s.toggleFullscreen}
            >
              {s.fullscreen ? '开' : '关'}
            </button>
          </div>
        </div>

        {/* 返回 */}
        <button className="settings-back-btn" onClick={onBack}>
          返 回
        </button>
      </div>
    </div>
  )
}
