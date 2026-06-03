// ========== 剧本指令类型 ==========

export type EffectType = 'fade' | 'fadeIn' | 'fadeOut' | 'dissolve' | 'none'

export interface BgCommand {
  type: 'bg'
  src: string
  effect?: EffectType
}

export interface CharCommand {
  type: 'char'
  id: string
  pose: string
  pos: 'left' | 'center' | 'right'
  effect?: EffectType
}

export interface DialogueCommand {
  type: 'dialogue'
  speaker: string
  text: string
}

export interface NarrationCommand {
  type: 'narration'
  text: string
}

export interface JumpCommand {
  type: 'jump'
  target: string
}

export interface ChoiceOption {
  text: string
  next: JumpCommand
  setFlag?: Record<string, unknown>
  cond?: string
}

export interface ChoiceCommand {
  type: 'choice'
  prompt: string
  options: ChoiceOption[]
}

export interface BgmCommand {
  type: 'bgm'
  src: string
  loop?: boolean
  volume?: number
}

export interface SfxCommand {
  type: 'sfx'
  src: string
}

export interface SetFlagCommand {
  type: 'setFlag'
  key: string
  value: unknown
}

export interface BranchCommand {
  type: 'branch'
  cond: string
  then: string | JumpCommand
  else?: string | JumpCommand
}

export interface WaitCommand {
  type: 'wait'
  ms: number
}

export interface CgCommand {
  type: 'cg'
  src: string
  effect?: EffectType
}

export interface EndCommand {
  type: 'end'
  next?: string
}

export interface SceneCommand {
  type: 'scene'
  id: string
}

export type Command =
  | SceneCommand
  | BgCommand
  | CharCommand
  | DialogueCommand
  | NarrationCommand
  | ChoiceCommand
  | JumpCommand
  | BgmCommand
  | SfxCommand
  | SetFlagCommand
  | BranchCommand
  | WaitCommand
  | CgCommand
  | EndCommand

// ========== 存档结构 ==========

export interface SaveData {
  slot: number
  savedAt: string
  label: string
  cursorIndex: number
  flags: Record<string, unknown>
}

// ========== 角色显示状态 ==========

export interface CharacterState {
  id: string
  pose: string
  pos: 'left' | 'center' | 'right'
  visible: boolean
}
