import React, { createContext, useContext, useMemo, useState } from 'react';
import { submitJobApplication } from '../api/http.js';

const JobApplicationContext = createContext(null);

const initialFormState = {
  fullName: '',
  email: '',
  phone: ''
};

export const JobApplicationProvider = ({ children }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const openApplication = (job) => {
    setSelectedJob(job);
    setFormState(initialFormState);
    setCvFile(null);
    setStatus(null);
  };

  const closeApplication = () => {
    setSelectedJob(null);
    setFormState(initialFormState);
    setCvFile(null);
    setStatus(null);
  };

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitApplication = async () => {
    if (!selectedJob) {
      return;
    }

    if (!cvFile) {
      setStatus({ type: 'error', message: 'Please attach your CV before submitting.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('fullName', formState.fullName);
      formData.append('email', formState.email);
      formData.append('phone', formState.phone);
      formData.append('cv', cvFile);

      await submitJobApplication(formData);

      setStatus({ type: 'success', message: 'Your application has been submitted successfully.' });
      setFormState(initialFormState);
      setCvFile(null);
    } catch (submitError) {
      setStatus({ type: 'error', message: submitError.message });
    } finally {
      setSubmitting(false);
    }
  };

  const value = useMemo(
    () => ({
      selectedJob,
      formState,
      cvFile,
      submitting,
      status,
      openApplication,
      closeApplication,
      updateField,
      setCvFile,
      submitApplication
    }),
    [selectedJob, formState, cvFile, submitting, status]
  );

  return <JobApplicationContext.Provider value={value}>{children}</JobApplicationContext.Provider>;
};

export const useJobApplication = () => {
  const context = useContext(JobApplicationContext);

  if (!context) {
    throw new Error('useJobApplication must be used within JobApplicationProvider');
  }

  return context;
};
