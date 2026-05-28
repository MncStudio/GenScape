/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_DEEPSEEK_BASE_URL: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_AI_PROVIDER: 'deepseek' | 'claude'
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: Record<string, any>
  export default zhCn
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
