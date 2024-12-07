import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import ProjectList from './ProjectList';
import Editor from './Editor';
import VersionHistory from './VersionHistory';
import TitleBar from './TitleBar';
import { theme } from '../theme';

const Layout: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh', 
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}>
        <TitleBar />
        <Box sx={{ 
          display: 'flex',
          flex: 1,
          gap: 1.5,
          p: 1.5,
          overflow: 'hidden',
        }}>
          {/* 左侧项目列表 */}
          <Box sx={{ 
            width: '20%', 
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}>
            <ProjectList />
          </Box>

          {/* 中间编辑区域 */}
          <Box sx={{ 
            width: '60%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}>
            <Editor />
          </Box>

          {/* 右侧版本历史 */}
          <Box sx={{ 
            width: '20%',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
          }}>
            <VersionHistory />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
