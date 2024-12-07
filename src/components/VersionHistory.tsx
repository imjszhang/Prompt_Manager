import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useProjects } from '../store/ProjectContext';

const VersionHistory: React.FC = () => {
  const { activeProject, updateProject } = useProjects();
  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleRestore = (versionId: string) => {
    if (!activeProject) return;
    
    const version = activeProject.versions.find(v => v.id === versionId);
    if (!version) return;

    updateProject({
      ...activeProject,
      prompt: version.prompt,
      updatedAt: new Date().toISOString(),
    });
  };

  if (!activeProject) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">
          请选择一个项目以查看版本历史
        </Typography>
      </Box>
    );
  }

  const selectedVersion = selectedVersionId 
    ? activeProject.versions.find(v => v.id === selectedVersionId)
    : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">版本历史</Typography>
      </Box>

      {activeProject.versions.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            暂无版本历史
          </Typography>
        </Box>
      ) : (
        <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {activeProject.versions.slice().reverse().map((version) => (
            <ListItem 
              key={version.id} 
              disablePadding
              secondaryAction={
                <>
                  <IconButton 
                    edge="end" 
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setSelectedVersionId(version.id);
                      setOpenDialog(true);
                    }}
                    title="查看版本"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRestore(version.id)}
                    title="恢复此版本"
                  >
                    <RestoreIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemButton>
                <ListItemText 
                  primary={`版本 ${version.id.slice(-6)}`} 
                  secondary={
                    <>
                      {new Date(version.createdAt).toLocaleString()}
                      {version.responses.length > 0 && (
                        <Typography 
                          component="span" 
                          sx={{ 
                            ml: 1,
                            color: 'success.main',
                            fontSize: '0.75rem',
                          }}
                        >
                          • {version.responses.length} 个响应
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="version-details-dialog-title"
        disableRestoreFocus
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle id="version-details-dialog-title">
          版本详情
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            {selectedVersion && new Date(selectedVersion.createdAt).toLocaleString()}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVersion && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>提示词</Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  mb: 3,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedVersion.prompt}
              </Box>

              {selectedVersion.responses.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>模型响应</Typography>
                  {selectedVersion.responses.map((response, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}>
                        <Typography variant="subtitle2" color="primary">
                          {response.modelName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Token: {response.tokenUsage.totalTokens} 
                          (提示词: {response.tokenUsage.promptTokens}, 
                          完成: {response.tokenUsage.completionTokens})
                        </Typography>
                      </Box>
                      <Box sx={{ whiteSpace: 'pre-wrap' }}>
                        {response.content}
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>关闭</Button>
          {selectedVersion && (
            <Button 
              onClick={() => {
                handleRestore(selectedVersion.id);
                setOpenDialog(false);
              }}
              color="primary"
            >
              恢复此版本
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionHistory;
