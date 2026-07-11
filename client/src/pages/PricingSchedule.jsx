import React, { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { PricingModal } from '../components/sales/PricingModal.jsx';
import { fetchAllUnits, updateUnitPricing } from '../api/http.js';

export const PricingSchedule = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load units from API
  useEffect(() => {
    const loadUnits = async () => {
      setLoading(true);
      setError('');
      
      try {
        const payload = await fetchAllUnits({ status: 'Available' });
        const unitsArray = Array.isArray(payload) ? payload : (payload?.data || []);
        setUnits(unitsArray);
        if (unitsArray.length > 0) {
          setSelectedUnit(unitsArray[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, []);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
    setSelectedDates([]);
  };

  const getPriceForDate = (unit, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const monthKey = format(date, 'yyyy-MM');

    // Check for date override first
    if (unit.dateOverrides && unit.dateOverrides[dateKey]) {
      return unit.dateOverrides[dateKey];
    }

    // Check for month price
    if (unit.monthPrices && unit.monthPrices[monthKey]) {
      return unit.monthPrices[monthKey];
    }

    // Fall back to base price
    return unit.basePrice;
  };

  const handleDateClick = (date) => {
    if (!selectedUnit) return;

    if (!isSelecting) {
      // Start new selection
      setSelectedDates([date]);
      setIsSelecting(true);
    } else {
      // Continue selection or end it
      const lastDate = selectedDates[selectedDates.length - 1];
      const newSelection = [];
      
      // Create range between first and last selected date
      const startDate = selectedDates[0];
      const endDate = date;
      
      const start = startDate < endDate ? startDate : endDate;
      const end = startDate < endDate ? endDate : startDate;
      
      const daysInRange = eachDayOfInterval({ start, end });
      setSelectedDates(daysInRange);
      setIsSelecting(false);
      
      // Open modal after selection is complete
      setTimeout(() => setShowModal(true), 100);
    }
  };

  const handleDateMouseDown = (date) => {
    if (!selectedUnit) return;
    setSelectedDates([date]);
    setIsSelecting(true);
  };

  const handleDateMouseEnter = (date) => {
    if (!isSelecting || !selectedUnit) return;
    
    const startDate = selectedDates[0];
    const daysInRange = eachDayOfInterval({ 
      start: startDate < date ? startDate : date, 
      end: startDate < date ? date : startDate 
    });
    setSelectedDates(daysInRange);
  };

  const handleDateMouseUp = () => {
    if (isSelecting && selectedDates.length > 0) {
      setIsSelecting(false);
      setTimeout(() => setShowModal(true), 100);
    }
  };

  const isSelected = (date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const isInSelectionRange = (date) => {
    if (selectedDates.length < 2) return false;
    const start = selectedDates[0];
    const end = selectedDates[selectedDates.length - 1];
    return date >= start && date <= end;
  };

  const handleSavePricing = async (payload) => {
    try {
      const response = await updateUnitPricing(payload.unitId, {
        price: payload.price,
        applyMode: payload.applyMode,
        dates: payload.dates,
        monthKey: payload.monthKey
      });

      // Update local state with response
      if (response) {
        const updatedUnit = response;
        setSelectedUnit(updatedUnit);
        setUnits(units.map(u => u._id === selectedUnit._id ? updatedUnit : u));
      }
    } catch (error) {
      console.error('Failed to save pricing:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#9db0c3]">Loading pricing schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9db0c3]">Pricing</p>
        <h1 className="mt-2 text-3xl font-bold text-[#f3f7fb]">Dynamic Pricing Calendar</h1>
        <p className="mt-1 text-sm text-[#9db0c3]">Manage availability and pricing across months</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Unit Selector */}
      <div className="rounded-xl border border-[#aec4dc]/14 bg-[#0e192a] p-4">
        <label className="block mb-2 text-sm text-[#9db0c3]">Select Unit</label>
        <select
          value={selectedUnit?._id || ''}
          onChange={(e) => {
            const unit = units.find(u => u._id === e.target.value);
            setSelectedUnit(unit);
            setSelectedDates([]);
          }}
          className="w-full rounded-xl border border-[#aec4dc]/12 bg-[#08101a] px-4 py-3 text-[#f4f8fb] focus:border-[#69d2c0] focus:outline-none"
        >
          {units.map(unit => (
            <option key={unit._id} value={unit._id}>
              {unit.uniqueId} - {unit.projectName}
            </option>
          ))}
        </select>
      </div>

      {selectedUnit && (
        <>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between rounded-xl border border-[#aec4dc]/14 bg-[#0e192a] p-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-2 rounded-lg border border-[#aec4dc]/12 bg-[#08101a] px-4 py-2 text-[#f3f7fb] hover:border-[#69d2c0]/30 transition-colors"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#69d2c0]" />
              <h2 className="text-xl font-bold text-[#f3f7fb]">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="flex items-center gap-2 rounded-lg border border-[#aec4dc]/12 bg-[#08101a] px-4 py-2 text-[#f3f7fb] hover:border-[#69d2c0]/30 transition-colors"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl border border-[#aec4dc]/14 bg-[#0e192a] p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-[#9db0c3]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div 
              className="grid grid-cols-7 gap-2"
              onMouseUp={handleDateMouseUp}
              onMouseLeave={handleDateMouseUp}
            >
              {monthDays.map(date => {
                const price = getPriceForDate(selectedUnit, date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const selected = isSelected(date);
                const inRange = isInSelectionRange(date);

                return (
                  <button
                    key={date.toISOString()}
                    onMouseDown={() => handleDateMouseDown(date)}
                    onMouseEnter={() => handleDateMouseEnter(date)}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative rounded-xl border p-3 text-left transition-all
                      ${isWeekend ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[#08101a] border-[#aec4dc]/12'}
                      ${selected ? 'border-[#69d2c0] bg-[#69d2c0]/20' : ''}
                      ${inRange && !selected ? 'border-[#69d2c0]/40 bg-[#69d2c0]/10' : ''}
                      hover:border-[#69d2c0]/50 hover:scale-105
                    `}
                  >
                    <div className="text-sm font-semibold text-[#f3f7fb]">
                      {format(date, 'd')}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <DollarSign size={12} className="text-[#69d2c0]" />
                      <span className="text-xs font-medium text-[#9db0c3]">
                        {price.toLocaleString()}
                      </span>
                    </div>
                    {selectedUnit.dateOverrides && selectedUnit.dateOverrides[format(date, 'yyyy-MM-dd')] && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#69d2c0]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#9db0c3]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#69d2c0]" />
                <span>Custom date override</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/20" />
                <span>Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#69d2c0]/20 border border-[#69d2c0]" />
                <span>Selected range</span>
              </div>
            </div>
          </div>

          {/* Current Month Summary */}
          <div className="rounded-xl border border-[#aec4dc]/14 bg-[#0e192a] p-6">
            <h3 className="text-lg font-bold text-[#f3f7fb] mb-4">Month Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#08101a] p-4 border border-[#aec4dc]/12">
                <p className="text-xs text-[#9db0c3]">Base Price</p>
                <p className="mt-1 text-xl font-bold text-[#f3f7fb]">
                  EGP {selectedUnit.basePrice?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-[#08101a] p-4 border border-[#aec4dc]/12">
                <p className="text-xs text-[#9db0c3]">Month Price</p>
                <p className="mt-1 text-xl font-bold text-[#69d2c0]">
                  EGP {(selectedUnit.monthPrices?.[format(currentMonth, 'yyyy-MM')] || selectedUnit.basePrice)?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-[#08101a] p-4 border border-[#aec4dc]/12">
                <p className="text-xs text-[#9db0c3]">Custom Overrides</p>
                <p className="mt-1 text-xl font-bold text-[#f3f7fb]">
                  {Object.keys(selectedUnit.dateOverrides || {}).filter(d => d.startsWith(format(currentMonth, 'yyyy-MM'))).length}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && selectedUnit && (
        <PricingModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDates([]);
          }}
          unit={selectedUnit}
          selectedDates={selectedDates}
          onSave={handleSavePricing}
        />
      )}
    </div>
  );
};
