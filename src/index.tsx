import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import JobNotifications from './components/JobNotifications';
import JobProvider from './components/JobProvider';
import JobSnackbar from './components/JobSnackbar';
import router from './router';
import handleUnhandledPromiseRejection from './utils/handleUnhandledPromiseRejection';

window.addEventListener('unhandledrejection', handleUnhandledPromiseRejection);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <JobProvider>
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        Components={{
          job: JobSnackbar,
        }}
      />
      <JobNotifications />
      <RouterProvider router={router} />
    </JobProvider>
  </React.StrictMode>
);

// Declare module augmentation for notistack to add the job variant
declare module 'notistack' {
  interface VariantOverrides {
    job: {
      type: string;
    };
  }
}
