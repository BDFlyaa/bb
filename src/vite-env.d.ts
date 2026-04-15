/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 例：`/api`（默认，走 Vite 代理）或 `http://localhost:3000/api` */
  readonly VITE_API_BASE_URL?: string;
}

interface Window {
  _AMapSecurityConfig: {
    securityJsCode: string;
  };
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}