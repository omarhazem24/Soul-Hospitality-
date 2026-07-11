import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

export const PricingModal = ({ open, onClose, unit, selectedDates, onSave }) => {
  const [price, setPrice] = useState('');
  const [applyMode, setApplyMode] = useState('day'); // 'day' or 'month'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPrice('');
      setApplyMode('day');
    }
  }, [open]);

  if (!open || !unit) return null;

  const formatDate = (date) => {
    if (typeof date === 'string') {
      return format(parseISO(date), 'MMM d, yyyy');
    }
    return format(date, 'MMM d, yyyy');
  };

  const getMonthKey = (date) => {
    if (typeof date === 'string') {
      return format(parseISO(date), 'yyyy-MM');
    }
    return format(date, 'yyyy-MM');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      unitId: unit._id,
      price: numericPrice,
      applyMode,
    };

    if (applyMode === 'day' && selectedDates.length > 0) {
      payload.dates = selectedDates.map(d => 
        typeof d === 'string' ? d : d.toISOString().split('T')[0]
      );
    } else if (applyMode === 'month' && selectedDates.length > 0) {
      payload.monthKey = getMonthKey(selectedDates[0]);
    }

    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Failed to save pricing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateRangeText = selectedDates.length === 1 
    ? formatDate(selectedDates[0])
    : `${formatDate(selectedDates[0])} - ${formatDate(selectedDates[selectedDates.length - 1])}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#0e192a] border border-[#aec4dc]/14 p-6 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#f3f7fb]">Update Pricing</h3>
          <p className="mt-1 text-sm text-[#9db0c3]">
            {unit.uniqueId} · {unit.projectName}
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-[#08101a] p-3 border border-[#aec4dc]/12">
          <p className="text-xs text-[#9db0c3]">Selected Date{selectedDates.length > 1 ? 's' : ''}</p>
          <p className="mt-1 text-sm font-semibold text-[#f3f7fb]">{dateRangeText}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm text-[#9db0c3]">Price per Night (EGP)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full rounded-xl border border-[#aec4dc]/12 bg-[#08101a] px-4 py-3 text-[#f4f8fb] placeholder-[#9db0c3]/50 focus:border-[#69d2c0] focus:outline-none"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 text-sm text-[#9db0c3]">Apply To</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-xl border border-[#aec4dc]/12 bg-[#08101a] p-3 cursor-pointer hover:border-[#69d2c0]/30 transition-colors">
                <input
                  type="radio"
                  name="applyMode"
                  value="day"
                  checked={applyMode === 'day'}
                  onChange={(e) => setApplyMode(e.target.value)}
                  className="w-4 h-4 accent-[#69d2c0]"
                />
                <div>
                  <p className="text-sm font-medium text-[#f3f7fb]">This Day Only</p>
                  <p className="text-xs text-[#9db0c3]">Update price for the selected date(s) only</p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-[#aec4dc]/12 bg-[#08101a] p-3 cursor-pointer hover:border-[#69d2c0]/30 transition-colors">
                <input
                  type="radio"
                  name="applyMode"
                  value="month"
                  checked={applyMode === 'month'}
                  onChange={(e) => setApplyMode(e.target.value)}
                  className="w-4 h-4 accent-[#69d2c0]"
                />
                <div>
                  <p className="text-sm font-medium text-[#f3f7fb]">This Entire Month</p>
                  <p className="text-xs text-[#9db0c3]">Update base price for the entire month</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#aec4dc]/14 bg-transparent px-4 py-3 text-[#e6eef7] hover:bg-[#aec4dc]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !price}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#69d2c0] to-[#8ad8ff] px-4 py-3 font-bold text-[#07101a] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
