import { loader } from '@monaco-editor/react';

const electron = window.require('electron');

// 声明 process.resourcesPath 类型
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
    vs: isDev
      ? 'node_modules/monaco-editor/min/vs'
      : `${process.resourcesPath}/app/node_modules/monaco-editor/min/vs`
  },
  'vs/nls': {
    availableLanguages: {
      '*': 'zh-cn'
    }
  }
});

// 默认编辑器选项
loader.init().then(monaco => {
  // 设置默认主题为深色
  monaco.editor.defineTheme('default-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
    }
  });
  monaco.editor.setTheme('default-dark');
});
