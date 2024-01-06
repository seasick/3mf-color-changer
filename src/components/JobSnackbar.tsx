import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  CustomContentProps,
  SnackbarContent,
  enqueueSnackbar,
  useSnackbar,
} from 'notistack';
import React, { useEffect } from 'react';
import { forwardRef, useState } from 'react';

import { Job, useJobContext } from './JobProvider';

interface JobSnackbarProps extends CustomContentProps {
  type: string;
}

const JobSnackbar = forwardRef<HTMLDivElement, JobSnackbarProps>(
  ({ id, type, ...props }, ref) => {
    const jobContext = useJobContext();
    const { closeSnackbar } = useSnackbar();

    const [progress, setProgress] = useState(0);
    const [jobs, setJobs] = useState<Job[]>(
      jobContext.jobs?.filter((job) => job.type === type)
    );

    // The idea behind the following code is to create a new snackbar for each job type.
    // The jobs are supposed to be enqueued with notistack's `preventDuplicate` option and the `key`
    // set to whatever type the job has. Because of this, there will only be one snackbar for each
    // job type at a time. If there are different jobs, they will be shown up in their own snackbar.
    // Whenever the list of jobs changes, the below code will run. We will then look for jobs of the
    // same type and add them to the list of jobs that are displayed in the snackbar, unless they are
    // already there.
    useEffect(() => {
      // Check if there are any jobs of the same type
      const filteredJobs = jobContext.jobs.filter((job) => job.type === type);

      // If there aren't, the job is finished and we can close the snackbar
      if (filteredJobs.length === 0) {
        enqueueSnackbar(`Job finished: ${props.message}`, {
          variant: 'success',
        });
        closeSnackbar(id);
        return;
      }

      // But if there are, we are going to add the new jobs to the
      // list of jobs that are displayed
      const filteredAndOldJobs = [...jobs];

      filteredJobs.forEach((job) => {
        if (!jobs.includes(job)) {
          filteredAndOldJobs.push(job);
        }
      });

      if (filteredAndOldJobs.length > jobs.length) {
        setJobs(filteredAndOldJobs);
      }
    }, [jobContext.jobs, setJobs, type, id, closeSnackbar]);

    // An interval is set up which will synchronize the progress of the jobs with
    // the progress of the snackbar. This is done by calculating the average progress of
    // all jobs of the same type and setting the snackbar's progress to that value.
    useEffect(() => {
      const interval = setInterval(() => {
        let newProgress = 0;
        jobs.forEach((job) => {
          newProgress += job.promise.progress || 0;
        });

        setProgress((newProgress / jobs.length) * 100);
      }, 500);

      return () => clearInterval(interval);
    }, [jobs]);

    return (
      <SnackbarContent ref={ref}>
        <Accordion
          sx={{
            borderRadius: 1,
            width: '100%',
            backgroundColor: '#2196f3',
            color: 'white',
          }}
        >
          <AccordionSummary
            expandIcon={
              jobs.length > 1 && <ExpandMoreIcon sx={{ color: 'white' }} />
            }
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Grid container>
              <Grid item xs={2}>
                <HourglassBottomIcon />
              </Grid>
              <Grid item xs={10}>
                <Typography>{props.message}</Typography>
                <LinearProgress
                  variant={jobs[0].progressVariant || 'determinate'}
                  value={progress}
                  color={progress === 100 ? 'success' : 'primary'}
                />
              </Grid>
            </Grid>
          </AccordionSummary>
          {jobs.length > 1 && (
            <AccordionDetails sx={{ maxHeight: '40vh', overflow: 'scroll' }}>
              {/* List of all jobs and their progress */}
              {jobs.map((job, idx) => (
                <Paper key={idx} elevation={0} sx={{ mb: 1, p: 1 }}>
                  {job.promise.progress === 1 ? (
                    <CheckCircleIcon sx={{ color: 'green' }} />
                  ) : (
                    <CircularProgress
                      size="1rem"
                      variant={job.progressVariant || 'determinate'}
                      value={job.promise.progress * 100}
                    />
                  )}{' '}
                  {job.label}
                </Paper>
              ))}
            </AccordionDetails>
          )}
        </Accordion>
      </SnackbarContent>
    );
  }
);

JobSnackbar.displayName = 'JobSnackbar';

export default JobSnackbar;
