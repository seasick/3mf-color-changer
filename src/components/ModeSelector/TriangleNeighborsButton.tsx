import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import type { SxProps } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useEffect } from 'react';

import { TYPE as FIND_FACE_NEIGHBORS_TYPE } from '../../jobs/findFaceNeighbors';
import ProgressPromise from '../../utils/ProgressPromise';
import { useJobContext } from '../JobProvider';

type Props = {
  onClick: () => void;
  buttonSx?: SxProps;
};

export default function TriangleNeighborsButton({ onClick, buttonSx }: Props) {
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const jobContext = useJobContext();

  useEffect(() => {
    const interval = setInterval(() => {
      if (jobContext.jobs.length === 0 && processing) {
        setProcessing(false);
      } else if (jobContext.jobs.length > 0) {
        const jobs = jobContext.jobs.filter(
          (job) => job.type === FIND_FACE_NEIGHBORS_TYPE
        );

        if (jobs.length > 0) {
          const job = jobs[0]; // TODO handle multiple jobs of the same type

          if (!processing) {
            setProcessing(true);
          }

          if (job.promise instanceof ProgressPromise) {
            if (job.promise.progress > progress) {
              setProgress(job.promise.progress);
            }
          }
        } else {
          setProcessing(false);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  });

  return (
    <Tooltip
      title={
        <>
          <p>
            Selects the triangle neighbor painting tool to paint all triangles
            on the same plane.
          </p>
          {processing ? (
            <p>
              Triangle neighbors are currently calculated. Depending on the
              model size and its complexity, this could take a few seconds.
              Processed {Math.round(progress * 100)}% of triangles.
            </p>
          ) : null}
        </>
      }
      placement="right"
    >
      <span>
        <IconButton
          disabled={processing}
          onClick={onClick}
          sx={{
            ...buttonSx,
            background: processing
              ? `linear-gradient(90deg, rgba(188,219,191,1) ${Math.round(
                  progress * 100
                )}%, rgba(255,255,255,0) ${Math.round(progress * 100)}%)`
              : null,
          }}
        >
          <AutoFixNormalIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
