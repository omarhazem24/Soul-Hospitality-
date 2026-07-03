const units = [
  {
    title: 'North Coast Sea View Chalet',
    destination: 'North Coast',
    price: 'EGP 8,500 / night',
    badge: 'chalet'
  },
  {
    title: 'Marassi Skyline Penthouse',
    destination: 'Marassi',
    price: 'EGP 14,200 / night',
    badge: 'penthouse'
  },
  {
    title: 'Sokhna Family Apartment',
    destination: 'Ain Sokhna',
    price: 'EGP 5,300 / night',
    badge: 'apartment'
  }
];

import React from 'react';

export default function UnitsListPage() {
  return (
    <div className="grid" style={{ gap: 18 }}>
      <h3 className="section-title">Units List</h3>
      <div className="grid cards">
        {units.map((unit) => (
          <article className="card" key={unit.title}>
            <span className="badge">{unit.badge}</span>
            <h4 style={{ margin: '12px 0 8px' }}>{unit.title}</h4>
            <p className="helper">{unit.destination}</p>
            <strong style={{ display: 'block', marginTop: 14 }}>{unit.price}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}
