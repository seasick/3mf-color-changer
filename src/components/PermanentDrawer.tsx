import BugReportIcon from '@mui/icons-material/BugReport';
import GitHubIcon from '@mui/icons-material/GitHub';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

import config from '../etc/config.json';

const drawerWidth = 340;
const toolbarHeight = 64; // TODO Will this work everywhere?

type Props = {
  menu?: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

export default function PermanentDrawer({ menu, title, children }: Props) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            sx={{
              textDecoration: 'none',
              boxShadow: 'none',
              color: 'white',
            }}
            to="/"
          >
            {title}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
            }}
          ></Box>

          <Tooltip title="Report an issue">
            <IconButton
              component="a"
              href={config.github_issues}
              target="_blank"
            >
              <BugReportIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Go to GitHub repository">
            <IconButton component="a" href={config.github} target="_blank">
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {menu && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>{menu}</Box>
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, pt: 0 }}>
        <Toolbar />
        <Box
          sx={{
            width: `calc(100vw - ${menu ? drawerWidth : 0}px)`,
            height: `calc(100vh - ${toolbarHeight}px)`,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
