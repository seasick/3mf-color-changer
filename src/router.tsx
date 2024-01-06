import React from 'react';
import { createHashRouter } from 'react-router-dom';

import Editor from './components/Editor';
import Home from './components/Home';

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/editor',
    element: (
      <Editor
        onSettingsChange={(settings) => {
          if (localStorage) {
            localStorage.setItem('settings', JSON.stringify(settings));
          }
        }}
      />
    ),
    loader: () => {
      // Load settings from local storage
      if (localStorage) {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        return settings;
      }
      return null;
    },
  },
]);

export default router;
