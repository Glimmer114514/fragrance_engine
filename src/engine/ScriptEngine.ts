import type { Command, ChoiceOption, JumpCommand } from './types'
import { useGameStore } from '../stores/gameStore'

/**
 * 剧本引擎
 *
 * 执行模型：
 * - advance() 从当前 cursor 开始逐条执行指令
 * - 遇到 dialogue/narration/choice 等阻塞指令时暂停，等待用户交互
 * - 用户点击后再次调用 advance() 继续
 */
export class ScriptEngine {
  private commands: Command[] = []
  private get store() {
    return useGameStore.getState()
  }

  /** 加载剧本 */
  load(commands: Command[]): void {
    this.commands = commands
  }

  /**
   * 从指定游标开始执行，或从当前游标继续
   * 会一口气处理完所有非阻塞指令，停在第一个阻塞指令处
   */
  advance(fromCursor?: number): void {
    const state = useGameStore.getState()
    let cursor = fromCursor ?? state.cursorIndex

    while (cursor < this.commands.length) {
      const cmd = this.commands[cursor]
      cursor++

      let blocked = false

      switch (cmd.type) {
        case 'scene':
          // 场景标记，跳过
          break

        case 'bg':
          state.setBackground({ src: cmd.src, effect: cmd.effect ?? 'fade' })
          break

        case 'char':
          state.updateCharacter({
            id: cmd.id,
            pose: cmd.pose,
            pos: cmd.pos,
            visible: cmd.effect !== 'fadeOut'
          })
          break

        case 'dialogue':
          state.showDialogue(cmd.speaker, cmd.text)
          blocked = true
          break

        case 'narration':
          state.showNarration(cmd.text)
          blocked = true
          break

        case 'choice':
          state.showChoices(cmd.prompt, cmd.options.filter(opt => this.evalCond(opt.cond)))
          blocked = true
          break

        case 'bgm':
          state.playBGM({
            src: cmd.src,
            loop: cmd.loop ?? true,
            volume: cmd.volume ?? 0.7
          })
          break

        case 'sfx':
          // TODO: 播放音效
          console.log(`[SFX] ${cmd.src}`)
          break

        case 'setFlag':
          state.setFlag(cmd.key, cmd.value)
          break

        case 'branch': {
          const result = this.evalCond(cmd.cond)
          if (result) {
            cursor = this.resolveJump(cmd.then)
          } else if (cmd.else) {
            cursor = this.resolveJump(cmd.else)
          }
          break
        }

        case 'jump':
          cursor = this.resolveJump(cmd.target)
          break

        case 'wait':
          // TODO: 实现等待
          break

        case 'cg':
          // TODO: CG展示
          state.setBackground({ src: cmd.src, effect: cmd.effect ?? 'fade' })
          break

        case 'end':
          state.setPhase('title')
          blocked = true
          break
      }

      state.setCursorIndex(cursor)

      if (blocked) return
    }

    // 剧本执行完毕
    if (cursor >= this.commands.length) {
      state.setPhase('title')
    }
  }

  /** 处理玩家的选项选择 */
  handleChoice(option: ChoiceOption): void {
    const state = useGameStore.getState()

    // 应用选项的 flag 变更
    if (option.setFlag) {
      for (const [key, value] of Object.entries(option.setFlag)) {
        state.setFlag(key, value)
      }
    }

    state.hideChoices()

    // 跳转到选项指定的位置
    if (option.next && option.next.type === 'jump') {
      const targetIdx = this.findSceneIndex(option.next.target)
      if (targetIdx >= 0) {
        this.advance(targetIdx)
        return
      }
    }

    // 没有跳转目标就从当前位置继续
    this.advance()
  }

  /** 玩家点击后继续 */
  continue(): void {
    const state = useGameStore.getState()
    state.hideDialogue()
    state.hideNarration()
    this.advance()
  }

  /** 查找 scene 指令的索引 */
  private findSceneIndex(sceneId: string): number {
    return this.commands.findIndex(
      (c) => c.type === 'scene' && (c as { id: string }).id === sceneId
    )
  }

  /** 解析跳转目标 */
  private resolveJump(target: string | JumpCommand): number {
    const sceneId = typeof target === 'string' ? target : target.target
    const idx = this.findSceneIndex(sceneId)
    return idx >= 0 ? idx : 0
  }

  /** 简单的条件表达式求值 */
  private evalCond(cond: string | undefined): boolean {
    if (!cond) return true
    const flags = this.store.flags

    try {
      // 对 !flags.xxx 的处理
      let expr = cond.replace(/!flags\.(\w+)/g, (_, key) => `${!flags[key]}`)
      // 对 flags.xxx 的处理
      expr = expr.replace(/flags\.(\w+)/g, (_, key) => JSON.stringify(flags[key]))
      // eslint-disable-next-line no-new-func
      return new Function(`return (${expr})`)()
    } catch {
      console.warn(`[ScriptEngine] 条件表达式无效: ${cond}`)
      return true
    }
  }
}

/** 全局单例 */
export const scriptEngine = new ScriptEngine()
