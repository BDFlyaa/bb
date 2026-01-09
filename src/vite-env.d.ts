/// <reference types="vite/client" />

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