import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/http.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;

    fetchDashboardSummary()
      .then((payload) => {
        if (active) {
          setSummary(payload);
        }
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  const metrics = [
    { label: 'Total Units', value: summary?.totalUnits || 0 },
    { label: 'Total Reservations', value: summary?.totalReservations || 0 },
    { label: 'Active Vacancies', value: summary?.activeVacancies || 0 },
    { label: 'Total Applicants', value: summary?.totalApplicants || 0 }
  ];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <h3 className="section-title">Dashboard</h3>

      <div className="grid cards">
        {metrics.map((metric) => (
          <div className="card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span className="card-meta">{metric.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
