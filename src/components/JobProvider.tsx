import React, { createContext, useState } from 'react';

import ProgressPromise from '../utils/ProgressPromise';

export type Job = {
  promise: ProgressPromise<void>;
  type: string;
  label?: string;
};

type ContextValue = {
  jobs: Job[];
  addJob: (job: Job) => void;
};

// Create a new context
export const JobContext = createContext<ContextValue>({} as ContextValue);

// Define the props for the JobProvider component
interface JobProviderProps {
  children: React.ReactNode;
}

// Define the JobProvider component
const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  // Define the state variables and their initial values
  const [jobs, setJobs] = useState<Job[]>([]);

  const addJob = (job: Job) => {
    job.promise.then(() => {
      console.log('Job finished');
      setJobs((prevJobs) => prevJobs.filter((j) => j !== job));
    });

    setJobs((prevJobs) => [...prevJobs, job]);
  };

  // Return the context provider with the provided value
  return (
    <JobContext.Provider value={{ jobs, addJob }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => React.useContext(JobContext);

export default JobProvider;
