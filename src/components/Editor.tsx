import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import '../monaco-config';  // 导入 Monaco 配置
import { ModelConfig as IModelConfig, ProjectVersion, ModelResponse } from '../types';
import { useProjects } from '../store/ProjectContext';
import { APIService } from '../utils/apiService';
import ModelConfig from './ModelConfig';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';

// 预设的模型配置
const DEFAULT_MODELS: IModelConfig[] = [
  {
    name: 'DeepSeek Chat',
    modelName: 'deepseek-chat',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: '',
    enabled: false,
  },
  {
    name: 'Kimi Chat',
    modelName: 'moonshot-v1-8k',
    apiEndpoint: 'https://api.moonshot.cn/v1/chat/completions',
    apiKey: '',
    enabled: false,
  }
];

const Editor: React.FC = () => {
  const { activeProject, updateProject, addVersion } = useProjects();
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState<IModelConfig[]>(() => {
    const savedModels = localStorage.getItem('prompt-manager-models');
    return savedModels ? JSON.parse(savedModels) : DEFAULT_MODELS;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelConfigOpen, setIsModelConfigOpen] = useState(false);
  const [responseHeight, setResponseHeight] = useState(300);
  const apiService = APIService.getInstance();
  const monaco = useMonaco();

  useEffect(() => {
    localStorage.setItem('prompt-manager-models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    if (activeProject) {
      setPrompt(activeProject.prompt);
    } else {
      setPrompt('');
    }
  }, [activeProject]);

  // 确保 Monaco Editor 主题设置
  useEffect(() => {
    if (monaco) {
      // 强制设置主题为 vs-dark
      monaco.editor.setTheme('vs-dark');
    }
  }, [monaco]);

  const handleSaveVersion = () => {
    if (activeProject) {
      addVersion(activeProject.id, {
        id: Date.now().toString(),
        prompt,
        responses: [],
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleSendRequest = async () => {
    if (!activeProject) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const enabledModels = models.filter(m => m.enabled);
      if (enabledModels.length === 0) {
        throw new Error('请至少启用一个模型');
      }

      const responses: ModelResponse[] = await Promise.all(
        enabledModels.map(model =>
          apiService.sendRequest(prompt, model)
        )
      );

      addVersion(activeProject.id, {
        id: Date.now().toString(),
        prompt,
        responses,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          p: 2,
          gap: 2,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          justifyContent: 'flex-end',
        }}>
          <IconButton
            disabled
            sx={{ color: 'text.disabled' }}
          >
            <SettingsIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            disabled
          >
            保存版本
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            disabled
          >
            发送请求
          </Button>
        </Box>

        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minHeight: 0,
            position: 'relative',
          }}
        >
          {/* 提示词编辑器 */}
          <Box sx={{ 
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            opacity: 0.5,
            position: 'relative',
          }}>
            <MonacoEditor
              height="100%"
              defaultLanguage="markdown"
              value=""
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
              }}
            />
          </Box>

          {/* API 响应区域 */}
          <Box sx={{ 
            height: '300px',
            minHeight: 200,
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}>
            <MonacoEditor
              height="100%"
              defaultLanguage="json"
              value=""
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 1.6,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                lineNumbers: 'off',
                padding: { top: 16 },
              }}
            />
          </Box>

          {/* 提示覆盖层 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 1,
              backdropFilter: 'blur(2px)',
              zIndex: 1,
            }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.2)',
                maxWidth: '80%',
                '& .MuiAlert-message': {
                  fontSize: '1.1rem',
                },
              }}
            >
              请选择一个项目或创建新项目
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveVersion}
          disabled={!activeProject}
        >
          保存版本
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendRequest}
          disabled={!activeProject || isLoading}
        >
          发送请求
        </Button>
        <IconButton onClick={() => setIsModelConfigOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 300 }}>
        <MonacoEditor
          height="100%"
          defaultLanguage="markdown"
          value={prompt}
          onChange={(value) => setPrompt(value || '')}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: 'vs-dark'
          }}
          loading={<CircularProgress />}
        />
      </Box>

      {/* API 响应区域 */}
      <Box sx={{ 
        height: `${responseHeight}px`,
        minHeight: 200,
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        position: 'relative',
        '& .monaco-editor': {
          '.monaco-editor, .monaco-editor-background, .monaco-editor .inputarea.ime-input': {
            backgroundColor: 'transparent !important',
          },
          '.margin': {
            backgroundColor: 'rgba(0,0,0,0.2) !important',
          },
        },
      }}>
        {/* 拖动条 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            cursor: 'row-resize',
            bgcolor: 'divider',
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'primary.main',
              opacity: 0.3
            }
          }}
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startHeight = responseHeight;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const delta = moveEvent.clientY - startY;
              setResponseHeight(Math.max(200, startHeight - delta));
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        <MonacoEditor
          height={responseHeight - 4}
          defaultLanguage="json"
          value={activeProject?.versions.length 
            ? JSON.stringify({
                prompt: activeProject.versions[activeProject.versions.length - 1].prompt,
                responses: activeProject.versions[activeProject.versions.length - 1].responses.map(r => ({
                  model: r.modelName,
                  content: r.content,
                  tokenUsage: r.tokenUsage,
                })),
                createdAt: activeProject.versions[activeProject.versions.length - 1].createdAt,
              }, null, 2)
            : '// 模型响应将显示在这里'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 1.6,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            lineNumbers: 'off',
            padding: { top: 16 },
            theme: 'vs-dark'
          }}
          loading={<CircularProgress />}
        />
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ 
            borderRadius: 1,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          {error}
        </Alert>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: '50%',
          p: 1,
          boxShadow: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        }}>
          <CircularProgress />
        </Box>
      )}

      {/* 模型配置弹窗 */}
      <Dialog 
        open={isModelConfigOpen} 
        onClose={() => setIsModelConfigOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.1)',
          }
        }}
      >
        <DialogTitle>模型配置</DialogTitle>
        <DialogContent>
          <ModelConfig models={models} onModelsChange={setModels} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Editor;
