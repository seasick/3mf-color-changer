import { enqueueSnackbar } from 'notistack';
import React, { useEffect } from 'react';

import { TYPE as EXPORT_FILE_TYPE } from '../jobs/exportFile';
import { TYPE as FIND_FACE_NEIGHBORS_TYPE } from '../jobs/findFaceNeighbors';
import { useJobContext } from './JobProvider';

export default function JobNotifications() {
  const jobContext = useJobContext();

  useEffect(() => {
    if (!jobContext.jobs?.length) {
      return;
    }
    const types = jobContext.jobs.reduce((acc, job) => {
      if (!acc.includes(job.type)) {
        acc.push(job.type);
      }

      return acc;
    }, [] as string[]);

    types.forEach((job) => {
      enqueueSnackbar(getJobTitle(job), {
        variant: 'job',
        type: job,
        persist: true,
        preventDuplicate: true,
      });
    });
  }, [jobContext.jobs]);

  return <div />;
}

function getJobTitle(type: string) {
  switch (type) {
    case FIND_FACE_NEIGHBORS_TYPE:
      return 'Calculate face neighbors';
    case EXPORT_FILE_TYPE:
      return 'Export file';
    default:
      return 'Unknown job';
  }
}
