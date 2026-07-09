const Staff = require("../models/Staff");
const { startOfDay, startOfWeek, startOfMonth } = require("../utils/dateRanges");

// Staff performance counters (totalOrders, totalRevenue, today/week/
// month revenue) are updated incrementally by orderController when an
// order is completed. The today/week/month buckets only get reset the
// next time an order completes in a new period, so on read we correct
// any bucket that's stale (belongs to a past day/week/month) back to
// zero for display, without writing anything back to the database.
const presentStaff = (staffDoc) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const isSameDay =
    staffDoc.todayDate &&
    startOfDay(staffDoc.todayDate).getTime() === todayStart.getTime();

  const isSameWeek =
    staffDoc.weekStartDate &&
    new Date(staffDoc.weekStartDate).getTime() === weekStart.getTime();

  const isSameMonth =
    staffDoc.monthStartDate &&
    new Date(staffDoc.monthStartDate).getTime() === monthStart.getTime();

  return {
    ...staffDoc,
    todayRevenue: isSameDay ? staffDoc.todayRevenue || 0 : 0,
    weeklyRevenue: isSameWeek ? staffDoc.weeklyRevenue || 0 : 0,
    monthlyRevenue: isSameMonth ? staffDoc.monthlyRevenue || 0 : 0,
    totalOrders: staffDoc.totalOrders || 0,
    totalRevenue: staffDoc.totalRevenue || 0,
  };
};

// Get All Staff
// Supports ?status=Active to fetch only staff who are available to be
// assigned to an order (used by the "select staff" picker on order
// creation).
exports.getStaff = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const staff = await Staff.find(query).sort({ createdAt: -1 }).lean();
    const data = staff.map(presentStaff);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Create Staff
exports.createStaff = async (req, res, next) => {
  try {
    const employee = await Staff.create(req.body);

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update Staff
exports.updateStaff = async (req, res, next) => {
  try {
    const employee = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.json({
      success: true,
      message: "Staff updated successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Staff Reports
// Returns, for every staff member: total orders taken, all-time
// revenue, and today/this-week/this-month revenue — all read straight
// off the Staff document's running counters (see updateStaffStats in
// orderController), sorted by who's brought in the most revenue.
exports.getStaffReports = async (req, res, next) => {
  try {
    const staffList = await Staff.find().sort({ totalRevenue: -1 }).lean();
    const data = staffList.map(presentStaff);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Staff
exports.deleteStaff = async (req, res, next) => {
  try {
    const employee = await Staff.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
