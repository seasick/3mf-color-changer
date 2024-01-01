import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import React from 'react';

import config from '../etc/config.json';

export default function handleUnhandledPromiseRejection(promiseRejectionEvent) {
  const msg = (
    <div>
      <Typography variant="body1">
        <i>{promiseRejectionEvent.reason.toString()}</i>
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body1">
        Did you just encounter a bug? I&apos;d be happy to receive a bug report
        about it.{' '}
      </Typography>
    </div>
  );

  enqueueSnackbar(msg, {
    variant: 'error',
    autoHideDuration: 10000,
    action: (snackbarId) => (
      <Stack direction="row" spacing={2}>
        <Button
          component={Link}
          href={config.github_issues}
          target="_blank"
          sx={{ color: 'white' }}
        >
          Create bug report
        </Button>
        <Button
          onClick={() => {
            closeSnackbar(snackbarId);
          }}
          sx={{ color: 'white' }}
        >
          Dismiss
        </Button>
      </Stack>
    ),
  });
}
