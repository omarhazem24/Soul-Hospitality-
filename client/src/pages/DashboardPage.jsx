const metrics = [
  { label: 'Active units', value: '24' },
  { label: 'Bookings today', value: '9' },
  { label: 'Pending approvals', value: '3' },
  { label: 'Revenue this week', value: 'EGP 412k' }
];

const activity = [
  { label: 'Marassi penthouse', meta: 'Confirmed 8 min ago' },
  { label: 'Sokhna chalet', meta: 'Temporary hold expires in 11m' },
  { label: 'Admin review queue', meta: '3 employment requests' }
];

import React from 'react';

export default function DashboardPage() {
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

      <div className="split">
        <div className="card">
          <h4 className="section-title">Operational snapshot</h4>
          <p className="helper">
            The frontend can query availability, initiate checkout, and surface booking states without importing server modules.
          </p>
          <div className="list" style={{ marginTop: 16 }}>
            {activity.map((item) => (
              <div className="list-item" key={item.label}>
                <span>{item.label}</span>
                <span className="card-meta">{item.meta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 className="section-title">Booking pipeline</h4>
          <div className="list">
            <div className="list-item"><span>Discover units</span><span className="badge">Public</span></div>
            <div className="list-item"><span>Hold checkout</span><span className="badge">15 min TTL</span></div>
            <div className="list-item"><span>Confirm payment</span><span className="badge">Webhook</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
