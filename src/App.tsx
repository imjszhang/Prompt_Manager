import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { ProjectProvider } from './store/ProjectContext';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProjectProvider>
        <Layout />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
