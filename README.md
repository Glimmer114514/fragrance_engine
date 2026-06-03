<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" />
    <img alt="Fragrance" src="https://img.shields.io/badge/Fragrance-Engine-c2936c?style=for-the-badge&logo=hackthebox&logoColor=white" />
  </picture>
</p>

<p align="center">
  <samp>一款轻量、可高度定制的视觉小说引擎 &nbsp;·&nbsp; Electron + React + TypeScript + Zustand</samp>
</p>

<p align="center">
  <a href="https://github.com/Glimmer114514/fragrance_engine/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-c2936c?style=flat-square" />
  </a>
  <a href="#">
    <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-8b7a6b?style=flat-square" />
  </a>
  <a href="#">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-a89f91?style=flat-square" />
  </a>
</p>

---

## ✦ 简介

**Fragrance** 是一个面向创作者的轻量视觉小说引擎。

它不需要你学习 Ren'Py 的 Python DSL，也不需要安装笨重的 Unity 编辑器——如果你会写 **JSON** 和一点点 **HTML/CSS**，你就可以用它创造出独属于你的故事。

暖色调文艺风格的 UI、花瓣飘落的标题画面、浮动卡片的对话框……一切视觉元素都可以通过 CSS 完全自定义。引擎本身只做一件事：解释你的剧本，呈现在屏幕上。

| | |
|------|---|
| 🎭 **剧本驱动** | 用 JSON 编写剧本，`dialogue` / `narration` / `choice` / `branch` 一站搞定 |
| 🎨 **完全可定制** | 所有 UI 都是 React 组件，通过 CSS 变量控制主题色 |
| 💾 **10 槽存档** | IPC 文件存储 + localStorage 回退，跨平台兼容 |
| 🔁 **二周目系统** | 通关后自动解锁隐藏路线 |
| ⚙️ **游戏内设置** | 文字速度、自动播放、音量、全屏——全部可调 |
| 📦 **一键打包** | `npm run package` → 一个 .exe 安装包 |

---

## ✦ 快速开始

```bash
# 克隆仓库
git clone https://github.com/Glimmer114514/fragrance_engine.git
cd fragrance_engine

# 安装依赖
npm install

# 启动开发服务器（Windows 也可双击 dev.bat）
npm run dev

# 打包为 Windows 安装包
npm run package
```

> **环境要求：** Node.js 18+ · npm 9+

---

## ✦ 项目结构

```
fragrance_engine/
│
├── electron/                     # Electron 主进程
│   ├── main/index.ts             # 窗口创建、IPC 存档
│   └── preload/index.ts          # 安全暴露 API
│
├── src/                          # React 渲染进程
│   ├── engine/                   # 核心引擎
│   │   ├── types.ts              # 指令类型定义
│   │   └── ScriptEngine.ts       # 指令执行 & 条件求值
│   ├── stores/                   # Zustand 状态
│   │   ├── gameStore.ts          # 游戏运行时状态
│   │   └── settingsStore.ts      # 用户设置（持久化）
│   ├── services/                 # 服务层
│   │   ├── SaveManager.ts        # 存档 IO
│   │   └── ResourceManager.ts    # 资源路径
│   ├── components/               # UI 组件
│   │   ├── GameScreen.tsx        # 主舞台 & 路由
│   │   ├── TitleScreen.tsx       # 标题画面（花瓣动画）
│   │   ├── DialogueBox.tsx       # 对话框
│   │   ├── ChoicePanel.tsx       # 分支选项
│   │   ├── PauseMenu.tsx         # 暂停菜单
│   │   ├── SettingsPanel.tsx     # 设置面板
│   │   └── ...
│   └── assets/styles/global.css  # 全局样式
│
├── resources/scripts/            # 剧本 JSON
├── dev.bat                       # 一键启动
└── 使用手册.md                    # 中文手册
```

---

## ✦ 剧本编写

剧本是一个 JSON 数组。引擎按顺序解释指令，遇到对话/旁白/选项时暂停等待玩家交互。

### 一个最小的剧本

```json
[
  { "type": "scene", "id": "start" },
  { "type": "bg",  "src": "classroom", "effect": "fade" },
  { "type": "bgm", "src": "daily", "loop": true, "volume": 0.6 },
  { "type": "char", "id": "heroine", "pose": "normal", "pos": "center" },
  { "type": "dialogue", "speaker": "女主角", "text": "你来了。" },
  { "type": "narration", "text": "她的声音很轻，像落在水面上的花瓣。" },
  { "type": "end" }
]
```

### 支持的全部指令

| 类型 | 指令 | 说明 |
|------|------|------|
| 场景 | `scene` / `end` | 场景标记（跳转锚点）/ 结束返回标题 |
| 视觉 | `bg` / `char` / `cg` | 背景 / 立绘 / 全屏插画 |
| 文本 | `dialogue` / `narration` | 对话 / 旁白（阻塞指令） |
| 流程 | `choice` / `jump` / `branch` / `setFlag` / `wait` | 分支 / 跳转 / 条件 / 变量 / 等待 |
| 音频 | `bgm` / `sfx` | 背景音乐 / 音效 |

### 分支选项示例

```json
{
  "type": "choice",
  "prompt": "要怎么回应她？",
  "options": [
    {
      "text": "握住她的手",
      "next": { "type": "jump", "target": "hold_hand" },
      "setFlag": { "affection": 2 }
    },
    {
      "text": "假装没看到，低头继续看书",
      "next": { "type": "jump", "target": "ignore" },
      "setFlag": { "affection": -1 }
    },
    {
      "text": "（轻声）……我一直在等你",
      "next": { "type": "jump", "target": "confession" },
      "cond": "flags.week2"
    }
  ]
}
```

### 条件表达式

```js
"flags.affection >= 5"                     // 数值比较
"flags.met_her && !flags.already_told"     // 逻辑组合
"flags.week2 && flags.affection >= 12"     // 二周目隐藏路线
```

> 基于 `new Function()` 动态求值，支持标准 JavaScript 运算符。

---

## ✦ 键盘快捷键

| 场景 | 按键 | 动作 |
|------|------|------|
| 标题画面 | `Enter` | 开始新游戏 |
| 标题画面 | `Esc` | 退出应用 |
| 游戏中 | `Esc` | 暂停菜单 |
| 任意菜单 | `Esc` | 返回上一层 |

---

## ✦ 技术架构

```
剧本 JSON ──▶ ScriptEngine ──▶ Zustand Store ◀── React 组件
                                     │
                              SaveManager (IPC)
                                     │
                              本地文件系统
```

**阻塞执行模型：** 引擎对非阻塞指令一口气执行到底（批量 bg/char/setFlag 不会卡顿），遇到 `dialogue`/`narration`/`choice`/`end` 时停下等待交互。

**双 Store 设计：**
- `gameStore` — 运行时状态：phase、characters、dialogue、flags、cursor
- `settingsStore` — 持久化设置：音量、速度、全屏（带版本号自动重置）

---

## ✦ Star 历史

<p align="center">
  <a href="https://github.com/Glimmer114514/fragrance_engine/stargazers">
    <img src="https://img.shields.io/github/stars/Glimmer114514/fragrance_engine?style=social" alt="stars" />
  </a>
</p>

---

<p align="center">
  <samp>
    built with ♡ and <a href="https://react.dev">React</a> · <a href="https://www.electronjs.org">Electron</a> · <a href="https://github.com/pmndrs/zustand">Zustand</a>
  </samp>
</p>

<br />
