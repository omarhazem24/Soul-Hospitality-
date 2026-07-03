import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Account details</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">{user?.name || 'Saif Magdy'}</p>
        <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
        <p className="mt-2 text-sm text-slate-500">Role: {user?.role}</p>
      </div>
    </div>
  );
};
