import React from 'react';
import { HRJobManagementPage } from './HRJobManagementPage.jsx';
import { HRApplicationsQueue } from './HRApplicationsQueue.jsx';

export const AdminRecruitment = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Recruitment</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">HR recruitment workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          Publish vacancies, review the live candidate queue, and manage CVs from one administrative surface.
        </p>
      </div>

      <HRJobManagementPage />
      <HRApplicationsQueue />
    </div>
  );
};