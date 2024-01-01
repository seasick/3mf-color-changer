import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import router from './router';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    />
    <RouterProvider router={router} />
  </React.StrictMode>
);
