import React from 'react';

export default function CheckoutPage() {
  return (
    <div className="split">
      <div className="card">
        <h3 className="section-title">Checkout</h3>
        <p className="helper">
          The form below is a presentation shell for a future booking flow that calls the server API from src/api/http.js.
        </p>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="check-in">Check in</label>
            <input id="check-in" type="date" />
          </div>
          <div className="field">
            <label htmlFor="check-out">Check out</label>
            <input id="check-out" type="date" />
          </div>
          <div className="field">
            <label htmlFor="guests">Guests</label>
            <input id="guests" type="number" min="1" placeholder="4" />
          </div>
          <div className="field">
            <label htmlFor="payment">Payment method</label>
            <select id="payment">
              <option>Kashier Card</option>
              <option>Instapay</option>
              <option>Cash</option>
            </select>
          </div>
        </div>

        <div className="actions">
          <button className="primary" type="button">Reserve now</button>
          <button className="secondary" type="button">Save for later</button>
        </div>
      </div>

      <div className="card">
        <h4 className="section-title">Payment flow</h4>
        <div className="list">
          <div className="list-item"><span>1. Create hold</span><span className="badge">Redis TTL</span></div>
          <div className="list-item"><span>2. Receive callback</span><span className="badge">Kashier</span></div>
          <div className="list-item"><span>3. Confirm booking</span><span className="badge">MongoDB TX</span></div>
        </div>
      </div>
    </div>
  );
}
