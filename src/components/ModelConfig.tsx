import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ModelConfig as IModelConfig } from '../types';
import { APIService } from '../utils/apiService';

interface ModelConfigProps {
  models: IModelConfig[];
  onModelsChange: (models: IModelConfig[]) => void;
}

const ModelConfig: React.FC<ModelConfigProps> = ({ models, onModelsChange }) => {
  const [open, setOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<IModelConfig | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const apiService = APIService.getInstance();

  const handleAddModel = () => {
    setEditingModel({
      name: '',
      apiEndpoint: '',
      apiKey: '',
      enabled: false,
      modelName: '',
    });
    setOpen(true);
  };

  const handleEditModel = (model: IModelConfig) => {
    setEditingModel({ ...model });
    setOpen(true);
  };

  const handleDeleteModel = (modelName: string) => {
    if (window.confirm('确定删除这个模型么？')) {
      onModelsChange(models.filter(m => m.name !== modelName));
    }
  };

  const handleToggleModel = (modelName: string) => {
    onModelsChange(
      models.map(m =>
        m.name === modelName ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  const handleSaveModel = async () => {
    if (!editingModel) return;
    
    if (!editingModel.name || !editingModel.apiEndpoint || !editingModel.apiKey || !editingModel.modelName) {
      setValidationError('所有字段都是必填的');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const isValid = await apiService.validateAPIKey(editingModel);
      if (!isValid) {
        setValidationError('无效的API密钥或请求url');
        return;
      }

      const existingIndex = models.findIndex(m => m.name === editingModel.name);
      if (existingIndex >= 0) {
        onModelsChange(
          models.map((m, i) => (i === existingIndex ? editingModel : m))
        );
      } else {
        onModelsChange([...models, editingModel]);
      }
      setOpen(false);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      {/* 模型列表 */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 2,
        mt: 1,
      }}>
        {models.map((model, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: 'background.default',
              borderRadius: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              position: 'relative',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {model.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {model.modelName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                size="small"
                checked={model.enabled}
                onChange={(e) => handleToggleModel(model.name)}
              />
              <Typography variant="body2" color="text.secondary">
                {model.enabled ? '已启用' : '已禁用'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              mt: 'auto', 
              justifyContent: 'flex-end'
            }}>
              <IconButton
                size="small"
                onClick={() => handleEditModel(model)}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteModel(model.name)}
                sx={{ 
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.main', color: 'white' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* 添加模型按钮 */}
        <Box
          onClick={handleAddModel}
          sx={{
            bgcolor: 'background.default',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'divider',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Typography color="primary">添加模型</Typography>
        </Box>
      </Box>

      {/* 编辑模型对话框 */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setValidationError(null);
        }}
        maxWidth="sm"
        fullWidth
        aria-labelledby="model-config-dialog-title"
        disableRestoreFocus
      >
        <DialogTitle id="model-config-dialog-title">
          {editingModel?.name ? '编辑模型' : '添加模型'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="模型名称"
              value={editingModel?.name || ''}
              onChange={(e) => setEditingModel(prev => ({ ...prev!, name: e.target.value }))}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="模型标识"
              value={editingModel?.modelName || ''}
              onChange={(e) => setEditingModel(prev => ({ ...prev!, modelName: e.target.value }))}
              fullWidth
              variant="outlined"
              size="small"
              helperText="API 文档中的模型名称，如 gpt-4, gpt-3.5-turbo"
            />
            <TextField
              label="API 端点"
              value={editingModel?.apiEndpoint || ''}
              onChange={(e) => setEditingModel(prev => ({ ...prev!, apiEndpoint: e.target.value }))}
              fullWidth
              variant="outlined"
              size="small"
              helperText="完整的 API URL 地址"
            />
            <TextField
              label="API 密钥"
              value={editingModel?.apiKey || ''}
              onChange={(e) => setEditingModel(prev => ({ ...prev!, apiKey: e.target.value }))}
              type="password"
              fullWidth
              variant="outlined"
              size="small"
            />
            {validationError && (
              <Typography color="error" variant="body2">
                {validationError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setOpen(false);
              setValidationError(null);
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveModel}
            disabled={isValidating}
            startIcon={isValidating ? <CircularProgress size={20} /> : null}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModelConfig;
