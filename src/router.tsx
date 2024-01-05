import React from 'react';
import { createHashRouter } from 'react-router-dom';

import EditorRoute from './routes/Editor';
import HomeRoute from './routes/Home';

const router = createHashRouter([
  {
    path: '/',
    element: <HomeRoute />,
  },
  {
    path: '/editor',
    element: (
      <EditorRoute
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
