import { loader } from '@monaco-editor/react';

// 检查是否在 Electron 环境中运行
const isElectron = typeof window !== 'undefined' && window.require && window.require('electron');

// 声明 process.resourcesPath 类型（仅在 Electron 环境中有效）
declare global {
  namespace NodeJS {
    interface Process {
      resourcesPath: string;
    }
  }
}

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 配置 Monaco Editor 加载器
loader.config({
  paths: {
    vs: isElectron
      ? isDev
        ? 'node_modules/monaco-editor/min/vs'
        : `${process.resourcesPath}/app/node_modules/monaco-editor/min/vs`
      : 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs', // 浏览器环境使用 CDN
  },
  'vs/nls': {
    availableLanguages: {
      '*': 'zh-cn',
    },
  },
});

// 默认编辑器选项
loader.init().then((monaco) => {
  // 设置默认主题为深色
  monaco.editor.defineTheme('default-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
    },
  });
  monaco.editor.setTheme('default-dark');
});