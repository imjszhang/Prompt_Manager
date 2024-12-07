import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjects } from '../store/ProjectContext';

const ProjectList: React.FC = () => {
  const { 
    projects, 
    activeProject, 
    isLoading,
    createProject, 
    deleteProject,
    setActiveProject 
  } = useProjects();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await createProject(newProjectName);
      setNewProjectName('');
      setOpenDialog(false);
    }
  };

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除此项目吗？')) {
      await deleteProject(projectId);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">项目列表</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenDialog(true)}
        >
          新建项目
        </Button>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {projects.map((project) => (
          <ListItem 
            key={project.id} 
            disablePadding
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={(e) => handleDeleteProject(project.id, e)}
                title="删除项目"
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton 
              selected={activeProject?.id === project.id}
              onClick={() => setActiveProject(project.id)}
            >
              <ListItemText primary={project.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        aria-labelledby="create-project-dialog-title"
        disableRestoreFocus
      >
        <DialogTitle id="create-project-dialog-title">创建新项目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="项目名称"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleCreateProject}>确定</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
