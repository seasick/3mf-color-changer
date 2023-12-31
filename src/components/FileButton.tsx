import FileOpenIcon from '@mui/icons-material/FileOpen';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileButton({ onChange }: Props) {
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<FileOpenIcon />}
      fullWidth
    >
      Select File
      <VisuallyHiddenInput
        type="file"
        onChange={onChange}
        accept="application/vnd.ms-3mfdocument"
      />
    </Button>
  );
}
