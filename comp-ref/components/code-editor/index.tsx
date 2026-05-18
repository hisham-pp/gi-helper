'use client';

import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// Dynamic import with loading fallback
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false, // Disable SSR for Monaco Editor (browser-only)
  loading: () => (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      height='600px'
      border='1px solid #e0e0e0'
      borderRadius='4px'
    >
      <CircularProgress />
    </Box>
  ),
});

export default CodeEditor;
