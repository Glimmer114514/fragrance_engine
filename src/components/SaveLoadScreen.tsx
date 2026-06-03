import React, { useEffect, useState } from 'react'
import { SaveManager } from '../services/SaveManager'

interface SaveSlotInfo {
  slot: number
  savedAt: string
  label: string
}

interface Props {
  mode: 'save' | 'load'
  onBack: () => void
  onLoadSlot: (slotIndex: number) => void
}

/**
 * 存档 / 读档画面
 *
 * 支持 10 个存档槽位。
 * - save 模式：点击空位存档，已占用位可覆盖或删除
 * - load 模式：点击已占用位读档
 */
export const SaveLoadScreen: React.FC<Props> = ({ mode, onBack, onLoadSlot }) => {
  const [slots, setSlots] = useState<SaveSlotInfo[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    refreshSlots()
  }, [])

  const refreshSlots = async () => {
    const list = await SaveManager.list()
    setSlots(list)
  }

  const handleSlotClick = async (slotIndex: number) => {
    if (mode === 'load') {
      const exist = slots.find((s) => s.slot === slotIndex)
      if (!exist) {
        setMessage('该存档位为空')
        return
      }
      onLoadSlot(slotIndex)
    } else {
      await SaveManager.write(slotIndex)
      setMessage(`已保存至 存档 ${slotIndex + 1}`)
      await refreshSlots()
    }
  }

  const handleDelete = async (e: React.MouseEvent, slotIndex: number) => {
    e.stopPropagation()
    await SaveManager.delete(slotIndex)
    await refreshSlots()
    setMessage(`已删除 存档 ${slotIndex + 1}`)
  }

  return (
    <div className="save-load-screen">
      <h2>{mode === 'save' ? '保 存' : '读 取 存 档'}</h2>

      <div className="save-slots">
        {Array.from({ length: 10 }, (_, i) => {
          const exist = slots.find((s) => s.slot === i)
          return (
            <div key={i} className="save-slot" onClick={() => handleSlotClick(i)}>
              <span className="slot-num">存档 {i + 1}</span>
              <div className="slot-info">
                {exist ? (
                  <>
                    <div className="slot-label">{exist.label}</div>
                    <div className="slot-time">
                      {new Date(exist.savedAt).toLocaleString('zh-CN')}
                    </div>
                  </>
                ) : (
                  <div className="slot-empty">—— 空 ——</div>
                )}
              </div>
              {exist && mode === 'save' && (
                <button className="slot-delete" onClick={(e) => handleDelete(e, i)}>
                  删除
                </button>
              )}
            </div>
          )
        })}
      </div>

      {message && (
        <div className="status-msg">{message}</div>
      )}

      <button className="back-btn" onClick={onBack}>
        返 回
      </button>
    </div>
  )
}
