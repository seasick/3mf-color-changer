import FiberNewIcon from '@mui/icons-material/FiberNew';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Tooltip,
} from '@mui/material';
import type { SxProps } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  buttonSx?: SxProps;
};

export default function UseNewModelButton({ buttonSx }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleResetClick = () => {
    setOpen(true);
  };
  const handleCloseAndNavigate = () => {
    navigate('/');
    setOpen(false);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Use a new model" placement="right">
        <IconButton onClick={handleResetClick} sx={buttonSx}>
          <FiberNewIcon />
        </IconButton>
      </Tooltip>

      {/* Dialog for asking the user if they are sure they want to use a new model */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to use a new model?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you use a new model, you will lose all of your changes to the
            current model.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            No, keep editing
          </Button>
          <Button onClick={handleCloseAndNavigate} autoFocus>
            Yes, lose changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
