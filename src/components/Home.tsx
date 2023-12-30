import ViewInArIcon from '@mui/icons-material/ViewInAr';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';

import examples from '../etc/examples.json';
import FileButton from './FileButton';

type Props = {
  onFileSelect: (e: File | string) => void;
};

export default function Home({ onFileSelect }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        This web app helps to add/change colors of 3d models. Currently it only
        supports 3MF files and can only change the color of whole meshes. Files
        loaded from your computer will not be sent to any server. You can either
        upload a file from your computer or select one of the examples below.
      </Alert>

      <Divider sx={{ mt: 5, mb: 5 }} />

      <FileButton onChange={handleFileChange} />

      <Divider sx={{ mt: 5, mb: 5 }}>OR</Divider>

      <Typography variant="body2">
        Select an example 3MF file to get started.
      </Typography>
      <List>
        {examples.map((example, idx) => (
          <ListItemButton key={idx} onClick={() => onFileSelect(example.path)}>
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
    </>
  );
}
