import ViewInArIcon from '@mui/icons-material/ViewInAr';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import FileDrop from '../components/FileDrop';
import PermanentDrawer from '../components/PermanentDrawer';
import config from '../etc/config.json';
import examples from '../etc/examples.json';

export default function HomeRoute() {
  const title = config.title;
  const navigate = useNavigate();

  const handleExampleSelect = (path: string) => {
    navigate('/editor?example=' + path);
  };

  const handleFileChange = (file: File) => {
    navigate('/editor', { state: { file } });
  };

  return (
    <PermanentDrawer title={title}>
      <Box sx={{ p: 1, height: '100%' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This web app helps to add/change colors of 3d models. Currently it
          only supports 3MF files and can only change the color of whole meshes.
          Files loaded from your computer will not be sent to any server. You
          can either upload a file from your computer or select one of the
          examples below.
        </Alert>

        <Stack
          direction="column"
          justifyContent="space-evenly"
          alignItems="center"
          spacing={2}
        >
          <FileDrop
            onDrop={(files) => handleFileChange(files[0])}
            sx={{ mt: 2, width: '100%' }}
          >
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: '70vh' }}
            >
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {title}
                  </Typography>

                  <Typography variant="h6">
                    Drag and drop a 3MF file or click here.
                  </Typography>
                </Box>
                <Divider sx={{ mt: 5, mb: 5 }} />

                <Typography variant="h6" sx={{ textAlign: 'center' }}>
                  Try one of these examples
                </Typography>
                <List>
                  {examples.map((example, idx) => (
                    <ListItemButton
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExampleSelect(example.path);
                      }}
                    >
                      <ListItemIcon>
                        <ViewInArIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={example.label}
                        secondary={example.description || ''}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Grid>
            </Grid>
          </FileDrop>
        </Stack>
      </Box>
    </PermanentDrawer>
  );
}
