const amenities = ['Sea view', 'Private terrace', 'High-speed Wi-Fi', 'Housekeeping'];

import React from 'react';

export default function UnitDetailsPage() {
  return (
    <div className="split">
      <div className="card">
        <h3 className="section-title">Unit Details</h3>
        <p className="helper">
          This page is isolated for unit-level UX, keeping data fetching and presentation separate from the backend.
        </p>

        <div className="list" style={{ marginTop: 18 }}>
          {amenities.map((item) => (
            <div className="list-item" key={item}>
              <span>{item}</span>
              <span className="badge">Included</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h4 className="section-title">Property snapshot</h4>
        <div className="list">
          <div className="list-item"><span>Bedrooms</span><span>3</span></div>
          <div className="list-item"><span>Bathrooms</span><span>2</span></div>
          <div className="list-item"><span>Guests</span><span>6</span></div>
          <div className="list-item"><span>Status</span><span className="badge">Active</span></div>
        </div>
      </div>
    </div>
  );
}
