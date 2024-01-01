import type { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

type Props = {
  onDrop: (files: File[]) => void;
  sx?: SxProps;
  children?: React.ReactNode;
};

export default function FileDrop({ children, onDrop, sx }: Props) {
  const { fileRejections, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop: (files) => {
        if (files?.length) {
          onDrop(files);
        }
      },
      accept: {
        'application/vnd.ms-3mfdocument': ['.3mf'],
      },
      maxFiles: 1,
    });

  useEffect(() => {
    fileRejections.forEach((file) => {
      file.errors.forEach((error) => {
        const msg = `${file.file.name} - ${error.message}`;
        enqueueSnackbar(msg, { variant: 'error' });
      });
    });
  }, [fileRejections]);

  sx = {
    cursor: 'pointer',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#aaa',
    p: 1,
    backgroundColor: isDragActive ? '#eee' : '#fff',
    ...sx,
  };

  return (
    <Box component="div" sx={sx} {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </Box>
  );
}
