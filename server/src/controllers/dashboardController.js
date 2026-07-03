import { Booking } from '../models/Booking.js';
import Unit from '../models/Unit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getDateBounds = ({ year, month }) => {
  const resolvedYear = Number(year) || new Date().getFullYear();
  const resolvedMonth = month ? Number(month) : null;

  if (resolvedMonth) {
    const start = new Date(resolvedYear, resolvedMonth - 1, 1);
    const end = new Date(resolvedYear, resolvedMonth, 1);
    return { start, end, resolvedYear, resolvedMonth };
  }

  const start = new Date(resolvedYear, 0, 1);
  const end = new Date(resolvedYear + 1, 0, 1);
  return { start, end, resolvedYear, resolvedMonth };
};

const activeStatuses = ['temporary_hold', 'pending', 'approved', 'confirmed'];

const normalizeProjectName = (value) => String(value || 'Unassigned').trim();

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

export const getDashboardSummary = asyncHandler(async (request, response) => {
  const { start, end, resolvedYear, resolvedMonth } = getDateBounds(request.query);
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [units, reservations, checkInsToday, checkOutsToday] = await Promise.all([
    Unit.find().lean(),
    Booking.find().populate('unit', 'projectName status').lean(),
    Booking.countDocuments({ startDate: { $gte: todayStart, $lt: todayEnd }, status: { $in: activeStatuses } }),
    Booking.countDocuments({ endDate: { $gte: todayStart, $lt: todayEnd }, status: { $in: activeStatuses } })
  ]);

  const totalUnits = units.length;
  const totalReservations = reservations.length;

  const unitsByProject = units.reduce((accumulator, unit) => {
    const projectName = normalizeProjectName(unit.projectName || unit.location);
    if (!accumulator[projectName]) {
      accumulator[projectName] = [];
    }

    accumulator[projectName].push(unit);
    return accumulator;
  }, {});

  const reservationsByProject = reservations.reduce((accumulator, booking) => {
    const projectName = normalizeProjectName(booking.unit?.projectName || booking.unit?.location || 'Unassigned');
    if (!accumulator[projectName]) {
      accumulator[projectName] = [];
    }

    accumulator[projectName].push(booking);
    return accumulator;
  }, {});

  const occupancyByProject = Object.entries(unitsByProject)
    .map(([projectName, projectUnits]) => {
      const projectReservations = reservationsByProject[projectName] || [];
      const occupiedNow = projectReservations.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'rejected' && new Date(booking.startDate) < todayEnd && new Date(booking.endDate) >= todayStart).length;

      return {
        projectName,
        totalUnits: projectUnits.length,
        totalReservations: projectReservations.length,
        occupiedNow,
        occupancyPercent: projectUnits.length > 0 ? Math.round((occupiedNow / projectUnits.length) * 100) : 0
      };
    })
    .sort((left, right) => right.totalUnits - left.totalUnits);

  const monthReservations = reservations.filter((booking) => {
    const bookingDate = new Date(booking.createdAt || booking.startDate);
    return bookingDate >= start && bookingDate < end;
  });

  const annualReservations = reservations.reduce((accumulator, booking) => {
    const bookingYear = new Date(booking.createdAt || booking.startDate).getFullYear();
    const row = accumulator.find((item) => item._id.year === bookingYear);

    if (row) {
      row.totalBookings += 1;
      row.revenue += Number(booking.totalPrice || 0);
      return accumulator;
    }

    accumulator.push({ _id: { year: bookingYear }, totalBookings: 1, revenue: Number(booking.totalPrice || 0) });
    return accumulator;
  }, []);

  const monthlyRentals = monthReservations.reduce((accumulator, booking) => {
    const bookingMonth = new Date(booking.createdAt || booking.startDate);
    const key = `${bookingMonth.getFullYear()}-${bookingMonth.getMonth() + 1}`;
    const row = accumulator.find((item) => item._id.year === bookingMonth.getFullYear() && item._id.month === bookingMonth.getMonth() + 1);

    if (row) {
      row.totalBookings += 1;
      row.revenue += Number(booking.totalPrice || 0);
      return accumulator;
    }

    accumulator.push({ _id: { year: bookingMonth.getFullYear(), month: bookingMonth.getMonth() + 1 }, totalBookings: 1, revenue: Number(booking.totalPrice || 0), key });
    return accumulator;
  }, []);

  const financialSummary = reservations
    .filter((booking) => {
      const bookingDate = new Date(booking.createdAt || booking.startDate);
      return bookingDate >= start && bookingDate < end && booking.status === 'confirmed';
    })
    .reduce(
      (summary, booking) => {
        summary.totalBookings += 1;
        summary.totalRevenue += Number(booking.totalPrice || 0);
        return summary;
      },
      { totalBookings: 0, totalRevenue: 0 }
    );

  response.json({
    success: true,
    data: {
      period: {
        year: resolvedYear,
        month: resolvedMonth
      },
      totalUnits,
      totalReservations,
      checkInsToday,
      checkOutsToday,
      occupancyByProject,
      monthlyRentals,
      annualRentals,
      financialSummary
    }
  });
});
