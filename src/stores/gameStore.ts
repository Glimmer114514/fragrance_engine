import { create } from 'zustand'
import type { CharacterState, ChoiceOption } from '../engine/types'

export type GamePhase = 'title' | 'playing' | 'narration' | 'choice' | 'save' | 'load' | 'cg'

interface BackgroundState {
  src: string
  effect: string
}

interface DialogueState {
  speaker: string
  text: string
}

interface BgmState {
  src: string
  loop: boolean
  volume: number
}

interface GameStore {
  // --- 游戏阶段 ---
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  // --- 背景 ---
  background: BackgroundState | null
  setBackground: (bg:BackgroundState) => void

  // --- 角色立绘 ---
  characters: CharacterState[]
  updateCharacter: (char: CharacterState) => void
  removeCharacter: (id: string) => void
  clearCharacters: () => void

  // --- 对话框 ---
  dialogue: DialogueState | null
  showDialogue: (speaker: string, text: string) => void
  hideDialogue: () => void

  // --- 旁白 ---
  narration: string | null
  showNarration: (text: string) => void
  hideNarration: () => void

  // --- 选项 ---
  choices: ChoiceOption[] | null
  choicePrompt: string | null
  showChoices: (prompt: string, options: ChoiceOption[]) => void
  hideChoices: () => void

  // --- BGM ---
  bgm: BgmState | null
  playBGM: (bgm: BgmState) => void
  stopBGM: () => void

  // --- 标志位 (存档核心) ---
  flags: Record<string, unknown>
  setFlag: (key: string, value: unknown) => void
  loadFlags: (flags: Record<string, unknown>) => void

  // --- 引擎光标 ---
  cursorIndex: number
  setCursorIndex: (idx: number) => void

  // --- 重置 ---
  resetGame: () => void
}

const initialState = {
  phase: 'title' as GamePhase,
  background: null,
  characters: [] as CharacterState[],
  dialogue: null,
  narration: null,
  choices: null,
  choicePrompt: null,
  bgm: null,
  flags: {} as Record<string, unknown>,
  cursorIndex: 0
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setBackground: (bg) => set({ background: bg }),

  updateCharacter: (char) =>
    set((state) => {
      const existing = state.characters.findIndex((c) => c.id === char.id)
      if (existing >= 0) {
        const updated = [...state.characters]
        updated[existing] = char
        return { characters: updated }
      }
      return { characters: [...state.characters, char] }
    }),

  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id)
    })),

  clearCharacters: () => set({ characters: [] }),

  showDialogue: (speaker, text) =>
    set({ phase: 'playing', dialogue: { speaker, text } }),

  hideDialogue: () => set({ dialogue: null }),

  showNarration: (text) =>
    set({ phase: 'narration', narration: text }),

  hideNarration: () => set({ narration: null }),

  showChoices: (prompt, options) =>
    set({ phase: 'choice', choicePrompt: prompt, choices: options }),

  hideChoices: () => set({ phase: 'playing', choices: null, choicePrompt: null }),

  playBGM: (bgm) => set({ bgm }),

  stopBGM: () => set({ bgm: null }),

  setFlag: (key, value) =>
    set((state) => ({
      flags: { ...state.flags, [key]: value }
    })),

  loadFlags: (flags) => set({ flags }),

  setCursorIndex: (idx) => set({ cursorIndex: idx }),

  resetGame: () => set(initialState)
}))
