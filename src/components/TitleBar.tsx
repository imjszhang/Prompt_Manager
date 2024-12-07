import React from 'react';
import { Box, Typography } from '@mui/material';

const TitleBar: React.FC = () => {
  return (
    <Box
      sx={{
        height: '38px', // 标准 macOS 标题栏高度
        WebkitAppRegion: 'drag', // 使整个标题栏可拖动
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        // 为红绿灯按钮预留空间
        '& > *:first-of-type': {
          ml: '70px'
        }
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          color: 'text.secondary',
          fontWeight: 'medium'
        }}
      >
        Prompt Manager
      </Typography>
    </Box>
  );
};

export default TitleBar;
