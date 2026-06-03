/**
 * 资源管理器
 *
 * 统一管理资源路径的解析。
 * - 开发模式：资源放在 resources/ 目录下，通过相对路径引用
 * - 打包模式：资源打包在 ASAR 内
 *
 * 当前版本使用简单的路径映射，未来可扩展为自定协议。
 */

const RESOURCE_BASE = '../resources'

export const ResourceManager = {
  /** 获取图片资源的完整路径 */
  getImagePath(src: string): string {
    // 如果是 URL 或绝对路径，直接返回
    if (src.startsWith('http') || src.startsWith('data:')) return src

    // 优先尝试项目 resources 目录
    return `${RESOURCE_BASE}/images/${src}`
  },

  /** 获取音频资源的完整路径 */
  getAudioPath(src: string): string {
    if (src.startsWith('http') || src.startsWith('data:')) return src
    return `${RESOURCE_BASE}/audio/${src}`
  },

  /** 获取剧本 JSON 的路径 */
  getScriptPath(name: string): string {
    return `${RESOURCE_BASE}/scripts/${name}`
  }
}
