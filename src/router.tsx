import React from 'react';
import { createHashRouter } from 'react-router-dom';

import Editor, { Settings } from './components/Editor';
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
        const settings: Settings = JSON.parse(
          localStorage.getItem('settings') || '{}'
        );

        // Workaround: Vertex neighbors mode can not be used from the start, because
        // neighbors for the model have to be loaded first.
        if (settings.mode === 'vertex_neighbors') {
          settings.mode = 'vertex';
        }

        return settings;
      }
      return null;
    },
  },
]);

export default router;
