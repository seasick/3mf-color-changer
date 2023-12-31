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
    element: <EditorRoute />,
  },
]);

export default router;
